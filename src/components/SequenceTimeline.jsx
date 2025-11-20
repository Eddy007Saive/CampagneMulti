import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Trash2, Clock, MessageSquare, GripVertical } from 'lucide-react';

const SequenceTimeline = ({ relances, onChange }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(relances);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const ajouterEtape = () => {
    const nouvelleRelance = {
      id: Date.now(),
      joursApres: "",
      instruction: "",
      type: 'email'
    };
    onChange([...relances, nouvelleRelance]);
  };

  const supprimerEtape = (id) => {
    if (relances.length <= 1) {
      alert("Vous devez avoir au moins une étape");
      return;
    }
    onChange(relances.filter(r => r.id !== id));
  };

  const modifierEtape = (id, champ, valeur) => {
    onChange(relances.map(r => 
      r.id === id ? { ...r, [champ]: valeur } : r
    ));
  };

  const templatesRelance = {
    court: [
      { name: "Rappel Simple", content: "Bonjour {Prénom}, je vous écris pour savoir si vous aviez eu l'occasion de voir mon précédent email..." },
      { name: "Question Directe", content: "Bonjour {Prénom}, juste un petit 'up' sur mon dernier message..." }
    ],
    moyen: [
      { name: "Ressource Utile", content: "Bonjour {Prénom}, je ne veux pas être insistant, mais j'ai pensé que vous pourriez trouver..." },
      { name: "Étude de Cas", content: "Bonjour {Prénom}, en me basant sur votre profil, j'ai trouvé une étude de cas..." }
    ],
    long: [
      { name: "Clôture Polie", content: "Bonjour {Prénom}, je n'ai pas eu de retour de votre part..." },
      { name: "Valeur Finale", content: "Bonjour {Prénom}, avant de refermer ce dossier..." }
    ]
  };

  const getTemplatesSuggeres = (joursApres) => {
    if (joursApres <= 5) return templatesRelance.court;
    if (joursApres <= 10) return templatesRelance.moyen;
    return templatesRelance.long;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MessageSquare size={20} className="mr-2" />
          Votre séquence de mail
        </h3>
        <span className="text-sm text-gray-400">
          {relances.length} étape{relances.length > 1 ? 's' : ''} créée{relances.length > 1 ? 's' : ''}
        </span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sequence" direction="horizontal">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-4 overflow-x-auto pb-4 px-2"
              style={{
                background: snapshot.isDraggingOver ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
              }}
            >
              {relances.map((relance, index) => (
                <Draggable key={relance.id} draggableId={String(relance.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex-shrink-0 w-80 transition-all duration-200 ${
                        snapshot.isDragging ? 'scale-105 rotate-2' : ''
                      }`}
                    >
                      <div className="relative bg-gray-800 border-2 border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        {/* Header de l'étape */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical size={18} className="text-gray-500" />
                            </div>
                            <span className="text-white font-semibold">Étape {index + 1}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => supprimerEtape(relance.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Badge "attendre" */}
                        <div className="mb-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 border border-blue-600 rounded-full">
                            <Clock size={14} className="text-blue-400" />
                            <span className="text-blue-300 text-sm">attendre</span>
                            <input
                              type="number"
                              min="1"
                              value={relance.joursApres}
                              onChange={(e) => modifierEtape(relance.id, 'joursApres', e.target.value)}
                              className="w-12 bg-transparent border-b border-blue-400 text-blue-300 text-center focus:outline-none"
                              placeholder="2"
                            />
                            <span className="text-blue-300 text-sm">jours</span>
                          </div>
                        </div>

                        {/* Objet de l'étape */}
                        <div className="mb-3">
                          <label className="text-xs text-gray-400 mb-1 block">
                            Insérer objet de l'étape
                          </label>
                          <input
                            type="text"
                            placeholder="(même objet que la précédente étape)"
                            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </div>

                        {/* Templates suggérés */}
                        {relance.joursApres && (
                          <div className="mb-3">
                            <label className="text-xs text-gray-400 mb-2 block">
                              Templates suggérés :
                            </label>
                            <div className="flex flex-wrap gap-1">
                              {getTemplatesSuggeres(parseInt(relance.joursApres)).map((template, tIndex) => (
                                <button
                                  key={tIndex}
                                  type="button"
                                  onClick={() => modifierEtape(relance.id, 'instruction', template.content)}
                                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                                >
                                  {template.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Zone de texte */}
                        <textarea
                          value={relance.instruction}
                          onChange={(e) => modifierEtape(relance.id, 'instruction', e.target.value)}
                          rows={4}
                          placeholder="Rédigez votre message de relance..."
                          className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none resize-none"
                        />

                        {/* Bouton A/B testing */}
                        <button
                          type="button"
                          className="w-full mt-3 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus size={14} />
                          A/B testing
                        </button>

                        {/* Connecteur vers l'étape suivante */}
                        {index < relances.length - 1 && (
                          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                            <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
                            <div className="absolute -right-1 -top-1 w-2 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Bouton ajouter une étape */}
              <div className="flex-shrink-0 w-80">
                <button
                  type="button"
                  onClick={ajouterEtape}
                  className="w-full h-full min-h-[300px] border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-blue-400"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                    <Plus size={24} />
                  </div>
                  <span className="font-medium">Ajouter une étape</span>
                </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Actions globales */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
        >
          Tester votre mail
        </button>
        <button
          type="button"
          className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
        >
          Prévisualiser
        </button>
      </div>
    </div>
  );
};

export default SequenceTimeline;
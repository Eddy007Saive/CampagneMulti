import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  HelpCircle,
  Eye,
  Upload,
  Moon,
  Sun,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  Users,
  MapPin,
  Calendar,
  Languages,
  Building,
  MessageSquare,
  RefreshCw,
  Clock,
  Plus,
  Trash2,
  MoveUp,
  MoveDown
} from "lucide-react";
export const Step3Messages = ({ 
  formData,
  setFormData,
  carteSelectionnee,
  setCarteSelectionnee,
  ajouterRelance,
  supprimerRelance,
  modifierRelance,
  deplacerRelance,
  stepValidationErrors,
  handleChange,

}) => {
      const messageTemplates = [
    {
      name: "Approche Performance B2B",
      content: "Bonjour {Prénom}, en tant que {Titre du poste du prospect}, la performance de {Nom du département ou de l'équipe} est sans doute une de vos priorités. J'ai remarqué que votre entreprise, {Nom de l'entreprise du prospect}, opère dans un marché très compétitif, et je pense que notre solution pour {Problème spécifique de l'industrie} pourrait vous apporter un avantage concurrentiel. Je serais ravi de vous montrer, lors d'un appel rapide, comment {Nom de votre solution} a permis à des entreprises similaires d'augmenter leur {Indicateur de performance} de {Pourcentage}."
    },
    {
      name: "Approche Étude de Cas B2B",
      content: "Bonjour {Prénom}, nous avons récemment aidé {Nom de l'entreprise cliente}, une entreprise de votre secteur, à résoudre le problème de {Problème client}. Grâce à notre collaboration, ils ont pu {Résultat mesurable : exemple, réduire les coûts, augmenter l'efficacité}. Je serais curieux de savoir si vous rencontrez des défis similaires et si une solution comme la nôtre pourrait vous être utile. Seriez-vous disponible pour un court échange la semaine prochaine ?"
    },
    {
      name: "Approche Décontractée B2B",
      content: "Salut {Prénom}, en faisant quelques recherches sur le secteur, je suis tombé sur le profil de {Nom de l'entreprise du prospect} et j'ai été impressionné par {Mentionner une réussite, une actualité ou un projet de l'entreprise}. Nous avons un outil qui aide spécifiquement les entreprises comme la vôtre à {Bénéfice clé, par exemple : 'à mieux gérer leurs données clients' ou 'à optimiser leur supply chain'}. Cela vous dirait d'en discuter 10 minutes pour voir si on pourrait vous apporter quelque chose ?"
    },
    {
      name: "Approche Événement B2B",
      content: "Bonjour {Prénom}, je vous écris suite à {Nom de l'événement, du webinar, de la conférence} ou {un article que vous avez publié sur LinkedIn}. Votre point de vue sur {Sujet de la publication/conférence} est très pertinent, et je partage tout à fait votre opinion sur {Point précis}. C'est exactement ce que notre solution {Nom de votre solution} vise à améliorer pour nos clients. Auriez-vous un moment la semaine prochaine pour échanger sur le sujet ?"
    },
    {
      name: "Template Décontracté",
      content: "Salut {Prénom} ! Je suis tombé sur le profil de {Nom de l'entreprise du prospect} et je pense qu'on pourrait avoir une opportunité intéressante pour vous. Vous auriez 15 minutes pour en discuter ?"
    }
  ];

   const getTemplatesSuggeres = (joursApres) => {
    if (joursApres <= 5) return templatesRelanceParTiming.court;
    if (joursApres <= 10) return templatesRelanceParTiming.moyen;
    return templatesRelanceParTiming.long;
  };

    const templatesRelanceParTiming = {
    court: [
      {
        name: "Rappel Simple",
        content: "Bonjour {Prénom}, je vous écris pour savoir si vous aviez eu l'occasion de voir mon précédent email concernant {Nom de votre solution}. Je serais ravi de planifier un court échange si le sujet vous intéresse."
      },
      {
        name: "Question Directe",
        content: "Bonjour {Prénom}, juste un petit 'up' sur mon dernier message. Vous rencontrez des défis avec {Problème commun de l'industrie} en ce moment ?"
      },
      {
        name: "Contextualisée",
        content: "Bonjour {Prénom}, je me permets de vous renvoyer mon dernier email. Je suis convaincu que notre solution pourrait faire une vraie différence pour {Nom de l'entreprise du prospect} en termes de {Bénéfice clé}."
      },
      {
        name: "Aide",
        content: "Bonjour {Prénom}, en relisant votre profil, je me suis demandé si vous aviez besoin d'aide pour {Défi spécifique}. Si c'est le cas, mon email précédent pourrait vous être utile. N'hésitez pas."
      }
    ],
    moyen: [
      {
        name: "Ressource Utile",
        content: "Bonjour {Prénom}, je ne veux pas être insistant, mais j'ai pensé que vous pourriez trouver cet article de blog sur {Sujet pertinent} intéressant. Il aborde les défis que nous avons évoqués dans mon premier email. Cela pourrait vous donner une bonne idée de ce que nous faisons."
      },
      {
        name: "Webinar",
        content: "Bonjour {Prénom}, j'espère que tout va bien. Pour faire suite à notre échange manqué, nous organisons un webinar sur {Sujet du webinar}. Ce serait une excellente occasion de voir comment nous aidons des entreprises comme la vôtre."
      },
      {
        name: "Étude de Cas",
        content: "Bonjour {Prénom}, en me basant sur votre profil, j'ai trouvé une étude de cas qui pourrait vous intéresser. Elle détaille comment nous avons aidé {Nom de l'entreprise cliente} à {Résultat mesurable}. Laissez-moi savoir si vous souhaitez la consulter."
      },
      {
        name: "Vidéo Demo",
        content: "Bonjour {Prénom}, si vous êtes trop occupé pour un appel, j'ai préparé une courte vidéo de démonstration de {Nom de votre solution} qui vous montre les fonctionnalités les plus pertinentes pour votre secteur. Vous pouvez la regarder quand vous le souhaitez."
      }
    ],
    long: [
      {
        name: "Clôture Polie",
        content: "Bonjour {Prénom}, je n'ai pas eu de retour de votre part et je ne veux pas que mes messages deviennent des spams dans votre boîte de réception. Je vais clore ce dossier de mon côté, mais si l'idée d'améliorer {Bénéfice Clé} chez {Nom de l'entreprise du prospect} vous intéresse toujours, n'hésitez pas à me répondre."
      },
      {
        name: "Adieu Amical",
        content: "Bonjour {Prénom}, au cas où vous ne seriez plus intéressé par {Sujet du premier email}, je vous laisse. Si votre situation change, n'hésitez pas à me faire signe. Bon courage dans votre travail !"
      },
      {
        name: "Valeur Finale",
        content: "Bonjour {Prénom}, j'ai bien compris que le moment n'était pas idéal. Avant de refermer ce dossier, je voulais juste vous laisser une dernière ressource qui pourrait vous être utile pour la suite : {Lien vers un article, un guide...}. Je reste à votre disposition si vous avez des questions."
      },
      {
        name: "Question Directe",
        content: "Bonjour {Prénom}, est-ce que mes messages sont arrivés à un mauvais moment, ou est-ce que ce sujet n'est tout simplement pas pertinent pour vous ? Un simple 'oui' ou 'non' me suffit, et je vous laisserai tranquille."
      },
      {
        name: "Ultime Personnalisée",
        content: "Bonjour {Prénom}, j'imagine que votre boîte de réception est pleine. Je voulais juste prendre une dernière chance de vous contacter car je crois vraiment que notre solution peut aider {Nom de l'entreprise du prospect} à {Bénéfice clé}. Si cela n'est pas le cas, je vous souhaite une excellente semaine."
      }
    ]
  };

  return (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MessageSquare size={20} className="mr-2" />
                  Votre séquence de messages LinkedIn
                </h3>
                <span className="text-sm text-gray-400">
                  {formData.relances.length + 1} étape{formData.relances.length > 0 ? 's' : ''} créée{formData.relances.length > 0 ? 's' : ''}
                </span>
              </div>
  
              {stepValidationErrors.Template_message && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {stepValidationErrors.Template_message.message}
                  </p>
                </div>
              )}
  
              {stepValidationErrors.relances && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300 text-sm flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    {stepValidationErrors.relances.message}
                  </p>
                </div>
              )}
  
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-6 px-2">
                  <div className="flex-shrink-0 w-48">
                    <button
                      type="button"
                      onClick={() => setCarteSelectionnee('initial')}
                      className={`w-full relative rounded-lg p-4 transition-all duration-200 shadow-lg cursor-pointer ${carteSelectionnee === 'initial'
                        ? 'bg-gray-800 border-2 border-blue-500'
                        : 'bg-gray-800 border-2 border-gray-700 hover:border-blue-400'
                        }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <MessageSquare size={20} className="text-white" />
                        </div>
                        <span className="text-white font-semibold text-sm">Étape 1</span>
                        <span className="text-gray-400 text-xs">Message initial</span>
                      </div>
                      {formData.Template_message && formData.Template_message.length >= 10 && (
                        <div className="mt-2 text-center">
                          <span className="text-xs text-green-400">✓ Configuré</span>
                        </div>
                      )}
                    </button>
                  </div>
  
                  {formData.relances.length > 0 && (
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    </div>
                  )}
  
                  {formData.relances.map((relance, index) => (
                    <React.Fragment key={relance.id}>
                      <div className="flex-shrink-0 w-48">
                        <button
                          type="button"
                          onClick={() => setCarteSelectionnee(relance.id)}
                          className={`w-full relative rounded-lg p-4 transition-all duration-200 shadow-lg cursor-pointer ${carteSelectionnee === relance.id
                            ? 'bg-gray-800 border-2 border-blue-500'
                            : 'bg-gray-800 border-2 border-gray-700 hover:border-blue-400'
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                              <Clock size={20} className="text-white" />
                            </div>
                            <span className="text-white font-semibold text-sm">Étape {index + 2}</span>
                            <span className="text-gray-400 text-xs">
                              {relance.joursApres ? `Attendre ${relance.joursApres} jour${relance.joursApres > 1 ? 's' : ''}` : 'À configurer'}
                            </span>
                          </div>
                          {relance.joursApres && relance.instruction && relance.instruction.length >= 10 && (
                            <div className="mt-2 text-center">
                              <span className="text-xs text-green-400">✓ Configuré</span>
                            </div>
                          )}
  
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              supprimerRelance(relance.id);
                              if (carteSelectionnee === relance.id) {
                                setCarteSelectionnee('initial');
                              }
                            }}
                            className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </button>
                      </div>
  
                      {index < formData.relances.length - 1 && (
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
  
                  <div className="flex-shrink-0 w-48">
                    <button
                      type="button"
                      onClick={ajouterRelance}
                      className="w-full h-full min-h-[140px] border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-400"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <Plus size={20} />
                      </div>
                      <span className="font-medium text-sm">Ajouter</span>
                    </button>
                  </div>
                </div>
              </div>
  
              <div className="mt-8 p-6 bg-gray-800 rounded-lg border-2 border-gray-700">
                {carteSelectionnee === 'initial' ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-400" />
                        Message initial
                      </h4>
                    </div>
  
                    <div className="mb-4">
                      <label className="text-xs text-gray-400 mb-2 block">
                        Templates suggérés :
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {messageTemplates.map((template, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, Template_message: template.content }));
                              if (stepValidationErrors.Template_message) {
                                const newErrors = { ...stepValidationErrors };
                                delete newErrors.Template_message;
                                setStepValidationErrors(newErrors);
                              }
                            }}
                            className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                          >
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </div>
  
                    <textarea
                      value={formData.Template_message}
                      name="Template_message"
                      onChange={handleChange}
                      rows={6}
                      placeholder="Bonjour {Prénom}, j'espère que vous allez bien..."
                      className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none placeholder-gray-500"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      {formData.Template_message?.length || 0} caractères (minimum 10)
                    </div>
                  </>
                ) : (
                  <>
                    {(() => {
                      const relance = formData.relances.find(r => r.id === carteSelectionnee);
                      const relanceIndex = formData.relances.findIndex(r => r.id === carteSelectionnee);
                      if (!relance) return null;
  
                      return (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-white font-semibold flex items-center gap-2">
                              <Clock size={18} className="text-purple-400" />
                              Relance {relanceIndex + 1}
                            </h4>
                            <div className="flex items-center gap-2">
                              {relanceIndex > 0 && (
                                <button
                                  type="button"
                                  onClick={() => deplacerRelance(relanceIndex, 'up')}
                                  className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                                  title="Déplacer vers le haut"
                                >
                                  <MoveUp size={16} />
                                </button>
                              )}
                              {relanceIndex < formData.relances.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => deplacerRelance(relanceIndex, 'down')}
                                  className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                                  title="Déplacer vers le bas"
                                >
                                  <MoveDown size={16} />
                                </button>
                              )}
                            </div>
                          </div>
  
                          <div className="mb-4">
                            <label className="text-xs text-gray-400 mb-2 block">
                              Délai d'attente
                            </label>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-600 rounded-lg">
                              <Clock size={16} className="text-blue-400" />
                              <span className="text-blue-300">Attendre</span>
                              <input
                                type="number"
                                min="1"
                                value={relance.joursApres}
                                onChange={(e) => modifierRelance(relance.id, 'joursApres', e.target.value)}
                                className="w-16 bg-gray-900 border border-blue-500 rounded text-blue-300 text-center focus:outline-none focus:border-blue-400 px-2 py-1"
                                placeholder="2"
                              />
                              <span className="text-blue-300">jour{relance.joursApres > 1 ? 's' : ''}</span>
                            </div>
                          </div>
  
                          {relance.joursApres && (
                            <div className="mb-4">
                              <label className="text-xs text-gray-400 mb-2 block">
                                Templates suggérés pour {relance.joursApres} jour{relance.joursApres > 1 ? 's' : ''} :
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {getTemplatesSuggeres(parseInt(relance.joursApres)).map((template, tIndex) => (
                                  <button
                                    key={tIndex}
                                    type="button"
                                    onClick={() => modifierRelance(relance.id, 'instruction', template.content)}
                                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-gray-300"
                                  >
                                    {template.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
  
                          <textarea
                            value={relance.instruction}
                            onChange={(e) => modifierRelance(relance.id, 'instruction', e.target.value)}
                            rows={6}
                            placeholder="Bonjour {Prénom}, je reviens vers vous..."
                            className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none placeholder-gray-500"
                          />
                          <div className="text-xs text-gray-500 mt-2">
                            {relance.instruction?.length || 0} caractères (minimum 10)
                          </div>
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          );
};

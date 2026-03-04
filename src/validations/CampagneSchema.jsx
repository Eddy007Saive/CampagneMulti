import * as yup from "yup";

export const CampagneSchema = yup.object().shape({
  // ─── Champs de base ───
  nom: yup
    .string()
    .required("Le nom de la campagne est obligatoire")
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  posteRecherche: yup
    .string()
    .required("Le poste recherché est obligatoire")
    .min(2, "Minimum 2 caractères"),

  zoneGeographique: yup
    .string()
    .required("La zone géographique est obligatoire")
    .min(2, "Minimum 2 caractères"),

  languesParlees: yup
    .string()
    .required("Au moins une langue est requise"),

  secteursSOuhaites: yup
    .string()
    .required("Au moins un secteur est requis"),

  Template_message: yup
    .string()
    .required("La directive pour les messages est obligatoire")
    .min(10, "Minimum 10 caractères"),

  profilsParJour: yup
    .number()
    .typeError("Doit être un nombre")
    .required("Obligatoire")
    .min(1, "Minimum 1")
    .max(120, "Maximum 120"),

  messagesParJour: yup
    .number()
    .typeError("Doit être un nombre")
    .required("Obligatoire")
    .min(1, "Minimum 1")
    .max(40, "Maximum 40"),

  joursRafraichissement: yup
    .array()
    .min(1, "Sélectionnez au moins un jour")
    .required("Obligatoire"),

  relances: yup
    .array()
    .min(1, "Au moins une relance est requise")
    .of(
      yup.object().shape({
        joursApres: yup
          .number()
          .typeError("Délai requis")
          .min(1, "Le délai doit être d'au moins 1 jour")
          .required("Délai obligatoire"),
        instruction: yup
          .string()
          .required("Message obligatoire")
          .min(10, "Minimum 10 caractères"),
      })
    ),

  // ─── Champs Cold Email (conditionnels) ───
  coldEmail: yup.boolean(),

  coldDelayAfterFollowUp: yup.mixed().when("coldEmail", {
    is: true,
    then: () =>
      yup
        .number()
        .typeError("Doit être un nombre")
        .min(1, "Minimum 1 jour")
        .required("Délai obligatoire"),
    otherwise: () => yup.mixed().nullable(),
  }),

  coldEmailMode: yup.string().when("coldEmail", {
    is: true,
    then: () =>
      yup
        .string()
        .oneOf(["auto", "existing"], "Choisissez un mode")
        .required("Mode obligatoire"),
    otherwise: () => yup.string().nullable(),
  }),

  emeliaTimezone: yup.string().when("coldEmail", {
    is: true,
    then: () => yup.string().required("Fuseau horaire obligatoire"),
    otherwise: () => yup.string().nullable(),
  }),

  emeliaBcc: yup.string().when("coldEmail", {
    is: true,
    then: () =>
      yup
        .string()
        .nullable()
        .transform((v) => (v === "" ? null : v))
        .email("Doit être un email valide"),
    otherwise: () => yup.string().nullable(),
  }),

  emeliaSendingDays: yup.mixed().when("coldEmail", {
    is: true,
    then: () =>
      yup
        .array()
        .min(1, "Sélectionnez au moins un jour")
        .required("Jours obligatoires"),
    otherwise: () => yup.mixed().nullable(),
  }),

  emeliaSendingTimeStart: yup.string().when("coldEmail", {
    is: true,
    then: () => yup.string().required("Heure de début obligatoire"),
    otherwise: () => yup.string().nullable(),
  }),

  emeliaSendingTimeEnd: yup
    .string()
    .when(["coldEmail", "emeliaSendingTimeStart"], {
      is: (coldEmail, start) => coldEmail && !!start,
      then: () =>
        yup
          .string()
          .required("Heure de fin obligatoire")
          .test(
            "after-start",
            "L'heure de fin doit être après l'heure de début",
            function (end) {
              const { emeliaSendingTimeStart } = this.parent;
              if (!emeliaSendingTimeStart || !end) return true;
              return end > emeliaSendingTimeStart;
            }
          ),
      otherwise: () => yup.string().nullable(),
    }),

  emailSequence: yup.mixed().when("coldEmail", {
    is: true,
    then: () =>
      yup
        .array()
        .min(1, "Au moins un email requis")
        .of(
          yup.object().shape({
            subject: yup
              .string()
              .required("Sujet obligatoire")
              .min(3, "Sujet trop court"),
            message: yup
              .string()
              .required("Message obligatoire")
              .min(10, "Message trop court"),
          })
        ),
    otherwise: () => yup.mixed().nullable(),
  }),
});
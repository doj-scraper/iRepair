// Wizard Components
export {
  WizardModal,
  ControlledWizardModal,
} from "./wizard-modal";

export {
  WizardTrigger,
  HeroCTA,
  FloatingWizardTrigger,
} from "./wizard-trigger";

export {
  IntentStep,
  BrandStep,
  ModelStep,
  CategoryStep,
  SubcategoryStep,
  ResultsStep,
  StepRouter,
} from "./wizard-steps";

// Re-export types and hooks
export {
  useWizard,
  useFirstVisit,
  useWizardSearch,
  brandOptions,
  categoryOptions,
  type WizardState,
  type WizardActions,
  type WizardIntent,
  type WizardStep,
  type UseWizardReturn,
} from "@/hooks/use-wizard";

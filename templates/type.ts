
export type TemplateType =
  | "empty"
  | "express";
  
  export interface InstallTemplateArgs {
  appName: string;
  root: string;
  template: TemplateType;
  disableGit: boolean;
}
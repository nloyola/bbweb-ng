
/**
 * Information stored for a tab when using an "ngb-tabset".
 */
export interface Tab {

  heading: string;

}

export type IdToTab = Record<string, Tab>;

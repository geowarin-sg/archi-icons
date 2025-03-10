export interface IconFile {
  prefix: string;
  icons: Record<string, IconJson>;
}

export interface IconJson {
  body: string;
  width: number;
  height: number;
}

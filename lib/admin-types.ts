export type PluginActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialPluginActionState: PluginActionState = {
  status: "idle",
  message: "",
};

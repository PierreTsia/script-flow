import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id, DataModel } from "@/convex/_generated/dataModel";
import { FunctionReturnType } from "convex/server";

export type ScriptDocument = DataModel["scripts"]["document"];
export type ScriptEntitiesResult = FunctionReturnType<
  typeof api.scripts.getScriptEntities
>;

export const useScripts = () => {
  const uploadUrl = useMutation(api.scripts.getUploadUrl);

  const createNewScriptFromStorageId = useMutation(
    api.scripts.createNewScriptFromStorageId
  );

  const useGetScriptEntities = (scriptId: Id<"scripts">) =>
    useQuery(api.scripts.getScriptEntities, { scriptId });

  const uploadFile = async (file: File, url: string) => {
    const result = await fetch(url, {
      method: "POST",
      body: file,
    });
    if (!result.ok) {
      if (result.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      throw new Error("Upload failed");
    }

    const json = await result.json();
    return json.storageId;
  };

  const uploadScript = async (file: File) => {
    const name = file.name.replace(/\.[^/.]+$/, ""); // Strip file extension
    const url = await uploadUrl();
    const storageId = await uploadFile(file, url);
    createScript(storageId, name);
  };

  const createScript = (storageId: string, name: string) => {
    createNewScriptFromStorageId({ fileId: storageId, name });
  };

  const scripts = useQuery(api.scripts.getAll) ?? [];

  const deleteScript = useMutation(api.scripts.deleteScript);

  const deleteScriptById = (scriptId: Id<"scripts">) => {
    deleteScript({ scriptId });
  };

  const useScriptById = (scriptId: Id<"scripts">) => {
    const result = useQuery(api.scripts.getScript, {
      scriptId,
    });
    if (result?.data && result.accessLevel === "owner") {
      return { ...result.data, fileUrl: result.fileUrl };
    }
    return null;
  };

  return {
    uploadScript,
    scripts,
    deleteScriptById,
    useScriptById,
    useGetScriptEntities,
  };
};

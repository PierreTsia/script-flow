/* 
interface Script {
  id: Id<"scripts">
  userId: string
  name: string
  uploadedAt: number
  fileId: string
  metadata: {
    pageCount: number
    version?: string
    status: "processing" | "ready" | "error"
    lastModified: number
  }
  entities: {
    characters: Id<"characters">[]
    props: Id<"props">[]
    costumes: Id<"costumes">[]
    locations: Id<"locations">[]
  }
}
*/

import { mutation } from "@/convex/_generated/server";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
interface UploadScriptPayload {
  file: File;
  name: string;
}

export const useScripts = () => {
  const uploadUrl = useMutation(api.scripts.getUploadUrl);

  const createNewScriptFromStorageId = useMutation(
    api.scripts.createNewScriptFromStorageId
  );

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
    const url = await uploadUrl();
    const storageId = await uploadFile(file, url);
    createScript(storageId);
  };

  const createScript = (storageId: string) => {
    createNewScriptFromStorageId({ storageId });
  };

  const scripts = useQuery(api.scripts.getAll) ?? [];

  const deleteScript = useMutation(api.scripts.deleteScript);

  const deleteScriptById = (scriptId: Id<"scripts">) => {
    deleteScript({ scriptId });
  };

  return { uploadScript, scripts, deleteScriptById };
};

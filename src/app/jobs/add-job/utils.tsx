import { FiAlertCircle } from "react-icons/fi";

export const computeChecksum = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const hashBuffer = crypto.subtle.digest("SHA-256", arrayBuffer);
        hashBuffer
          .then((hash) => {
            const hashArray = Array.from(new Uint8Array(hash));
            const hashHex = hashArray
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
            resolve(hashHex);
          })
          .catch(reject);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export const renderError = (error: string) => (
    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
      <FiAlertCircle className="w-4 h-4" />
      <span>{error}</span>
    </div>
  );
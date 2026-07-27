import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import type { ImageItem } from "../types/ImageItem";

type AdminFormProps = {
    onAddImage: (image: ImageItem) => void;
};

type UploadResponse = {
    imageURL: string;
    blobName: string;
};

const maximumFileSize = 10 * 1024 * 1024;

function AdminForm({ onAddImage }: AdminFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewURLs, setPreviewURLs] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (selectedFiles.length === 0) {
            setPreviewURLs([]);
            return;
        }

        const objectURLs = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviewURLs(objectURLs)

        return () => { objectURLs.forEach((url) => URL.revokeObjectURL(url));
      };
    }, [selectedFiles]);

    function validateAndSelectFile(files: File[]) {
        setMessage("");

        const validFiles = files.filter((file) => {
          return file.type.startsWith("image/") && file.size <= maximumFileSize;
        });

        if (validFiles.length !== files.length) {
          setMessage("Some files were skipped because they were invalid or larger than 10 MB")
        }

        setSelectedFiles((currentFiles) => [...currentFiles, ...validFiles]);
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);

        if (files.length > 0) {
            validateAndSelectFile(files);
        }
    }

    function handleDragEnter(event: DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
      setIsDragging(true);
    }

    function handleDragLeave(event: DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();

      const nextElement = event.relatedTarget as Node | null;

      if (!nextElement || !event.currentTarget.contains(nextElement)) {
        setIsDragging(false);
      }
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const files = Array.from(event.dataTransfer.files);

      if (files.length > 0) {
        validateAndSelectFile(files)
      }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanTitle = title.trim();

        if (!cleanTitle || selectedFiles.length === 0) {
            setMessage("Title and image file are required",);
            return;
        }

        setIsSubmitting(true);
        setMessage("");

    try {
      const imageURLs: string[] = [];

      for (const file of selectedFiles) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);

         const uploadResponse = await fetch(
          "/api/images/upload",
          {
            method: "POST",
            body: uploadFormData,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error(
            `Upload failed with status ${uploadResponse.status}`,
          );
        }

        const uploadResult =
          (await uploadResponse.json()) as UploadResponse;

        imageURLs.push(uploadResult.imageURL);
      }

      const metadataResponse = await fetch(
        "/api/images",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: cleanTitle,
            description: description.trim(),
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            category: "images",
            imageURLs,
          }),
        },
      );

      if (!metadataResponse.ok) {
        throw new Error(
          `Metadata request failed with status ${metadataResponse.status}`,
        );
      }

      const createdImage = (await metadataResponse.json()) as ImageItem;

      onAddImage(createdImage);

      setTitle("");
      setDescription("");
      setTags("");
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Images uploaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Unable to upload and save the images.");
    } finally {
      setIsSubmitting(false);
    }
  }

    return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
        />
      </label>

      <label>
        Tags
        <input
          type="text"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder=""
        />
      </label>

      <div
        className={`upload-area ${isDragging ? "dragging" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag an image here or choose a file.</p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Image
        </button>

        <input
          ref={fileInputRef}
          className="file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        {selectedFiles.length > 0 && (
          <ul className="selected-file-list">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.lastModified}`}> {file.name} </li>
            ))}
          </ul>
        )}
      </div>

      {previewURLs.length > 0 && (
        <div className="admin-preview">
          <p>Preview</p>

          <div className="preview-grid">
            {previewURLs.map((url,index) => (
              <img 
              key={url}
              src={url}
              alt={`${title || "Image preview"} ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Uploading..." : "Upload Images"}
      </button>

      {message && <p className="admin-message">{message}</p>}
    </form>
  );
}


export default AdminForm;
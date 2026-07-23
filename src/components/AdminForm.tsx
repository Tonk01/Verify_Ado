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
    const [category, setCategory] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState("");
    const [message, setMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!selectedFile) {
            setPreviewURL("");
            return;
        }

        const objectURL = URL.createObjectURL(selectedFile);
        setPreviewURL(objectURL);

        return () => URL.revokeObjectURL(objectURL);
    }, [selectedFile]);

    function validateAndSelectFile(file: File) {
        setMessage("");

        if (!file.type.startsWith("image/")) {
            setMessage("Only image files are allowed.");
            return;
        }

        if (file.size > maximumFileSize) {
            setMessage("Image must be smaller than 10 MB");
            return;
        }

        setSelectedFile(file)
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (file) {
            validateAndSelectFile(file);
        }
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files?.[0];

        if(file) {
            validateAndSelectFile
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const cleanTitle = title.trim();

        if (!cleanTitle || !selectedFile) {
            setMessage("Title and image file are required")
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("image", selectedFile);

            const uploadResponse = await fetch("http://localhost:7071/api/images/upload", {
                method: "POST",
                body: uploadFormData,
                },
            );

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed with status ${uploadResponse.status}`);
            }

            const uploadResult = (await uploadResponse.json()) as UploadResponse;

            const metadataResponse = await fetch("http://localhost:7071/api/images", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: cleanTitle,
                    description: description.trim(),
                    tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean), 
                    category: category.trim() || "uncategorized",
                    imageURL: uploadResult.imageURL,
                }),
            },
        );

        if (!metadataResponse.ok) {
            throw new Error(`Metadata request failed with status ${metadataResponse.status}`,);
        }
        
        const createdImage = (await metadataResponse.json()) as ImageItem;

        onAddImage(createdImage);

        setTitle("");
        setDescription("");
        setTags("");
        setCategory("");
        setSelectedFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setMessage("Image uploaded successfully.");
        } catch (error) {
            console.error(error);
            setMessage("Unable to upload and save the image");
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

      <label>
        Category
        <input
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        />
      </label>

      <div
        className={`upload-area ${isDragging ? "dragging" : ""}`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
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
          onChange={handleFileChange}
        />

        {selectedFile && <p>{selectedFile.name}</p>}
      </div>

      {previewURL && (
        <div className="admin-preview">
          <p>Preview</p>
          <img src={previewURL} alt={title || "Image preview"} />
        </div>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Uploading..." : "Upload Image"}
      </button>

      {message && <p className="admin-message">{message}</p>}
    </form>
  );
}


export default AdminForm;
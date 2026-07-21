import { useState, type FormEvent } from "react";

export type NewImage = {
    title: string;
    description: string;
    tags: string[];
    imageURL: string;
};

type AdminFormProps = {
    onAddImage: (image: NewImage) => void;
};

function AdminForm({ onAddImage }: AdminFormProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [message, setMessage] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

    if (!title.trim() || !imageURL.trim()) {
        setMessage("Title and image are required");
        return;
    }

    onAddImage({
        title: title.trim(),
        description: description.trim(),
        tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        imageURL: imageURL.trim(),
    });

    setTitle("")
    setDescription("")
    setTags("")
    setImageURL("");
    setMessage("Image added successfully")
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
                        placeholder="Add tag"
                    />
                </label>

                <label>
                    Image URL
                    <input
                    type="url"
                    value={imageURL}
                    onChange={(event) => setImageURL(event.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                    />
                </label>

                {imageURL && (
                    <div className="admin-preview">
                        <p>Preview</p>
                        <img src={imageURL} alt={title || "Preview"}/>
                    </div>
                )}

                <button type="submit"> Add Image </button>

                {message && <p className="admin-message">{message}</p>}
        </form>
    );
}

export default AdminForm;
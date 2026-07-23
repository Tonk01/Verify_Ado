import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Admin from "./pages/Admin";
import type { ImageItem } from "./types/ImageItem";

type Page = "gallery" | "admin";

function App() {
  const [page, setPage] = useState<Page>("gallery");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadImages() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("http://localhost:7071/api/images");

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as ImageItem[];
        setImages(data);
      } catch (error) {
        console.error(error);
        setError("Unable to load images.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadImages();
  }, []);

  function handleAddImage(image: ImageItem) {
    setImages((currentImages) => [image, ...currentImages]);
    setPage("gallery");
  }

  const filteredImages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return images;
    }

    return images.filter((image) => {
      const searchableText = [image.title, image.description, image.category, ...image.tags,].join(" ").toLowerCase();

      return searchableText.includes(search);
    });
  }, [images, searchTerm]);

  return (
    <main className="app">
      <nav className="main-navigation">
        <button
          type="button"
          className={page === "gallery" ? "active" : ""}
          onClick={() => setPage("gallery")}
        >
          Gallery
        </button>

        <button
          type="button"
          className={page === "admin" ? "active" : ""}
          onClick={() => setPage("admin")}
        >
          Admin
        </button>
      </nav>

      {page === "admin" ? (
        <Admin onAddImage={handleAddImage} />
      ) : (
        <>
          <header className="page-header">
            <h1>Image Catalogue</h1>
            <p>Search uploaded images.</p>

            <input
              className="search-input"
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </header>

          {isLoading && <p className="empty-message">Loading images...</p>}

          {error && <p className="error-message">{error}</p>}

          {!isLoading && !error && (
            <section className="gallery">
              {filteredImages.map((image) => (
                <button
                  className="image-card"
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image.imageURL} alt={image.title} />

                  <div className="image-card-content">
                    <h2>{image.title}</h2>
                    <p>{image.description}</p>

                    <div className="tag-list">
                      {image.tags.map((tag) => (
                        <span key={`${image.id}-${tag}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </section>
          )}

          {!isLoading && !error && filteredImages.length === 0 && (
            <p className="empty-message">No matching images found.</p>
          )}
        </>
      )}

      {selectedImage && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.title}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              aria-label="Close image"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>

            <img
              className="modal-image"
              src={selectedImage.imageURL}
              alt={selectedImage.title}
            />

            <h2>{selectedImage.title}</h2>
            <p>{selectedImage.description}</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
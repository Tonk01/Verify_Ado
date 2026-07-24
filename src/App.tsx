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
  const [selectImageIndex, setSelectedImageIndex] = useState(0);
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

  function openImageViewer(image: ImageItem) {
    setSelectedImage(image);
    setSelectedImageIndex(0);
  }

  function closeImageViewer() {
    setSelectedImage(null);
  }

  function showPreviousImage() {
    if(!selectedImage) {
      return;
    }

    setSelectedImageIndex((currentIndex) => {
      if (currentIndex === 0) {
        return selectedImage.imageURLs.length - 1;
      }
      return currentIndex - 1;
    });
  }

  function showNextImage() {
    if(!selectedImage) {
      return;
    }

    setSelectedImageIndex((currentIndex) => {
      if(currentIndex === selectedImage.imageURLs.length - 1)
    {
      return 0;
    }
    return currentIndex +1;
    });
  }

  const filteredImages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return images;
    }

    return images.filter((image) => {
      const searchableText = [image.title, image.description, ...image.tags,].join(" ").toLowerCase();

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
            <p>Search for uploaded images.</p>

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
              {filteredImages.map((image) => {
                const coverImage = image.imageURLs?.[0];

                return (
                  <button
                    className="image-card"
                    key={image.id}
                    type="button"
                    onClick={() => openImageViewer(image)}
                  >
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={image.title}
                      />
                    ) : (
                      <div className="missing-image">
                        No image available
                      </div>
                    )}

                    <div className="image-card-content">
                      <h2>{image.title}</h2>
                      <p>{image.description}</p>

                      {image.imageURLs.length > 1 && (
                        <p className="image-count">
                          {image.imageURLs.length} images
                        </p>
                      )}

                      <div className="tag-list">
                        {image.tags.map((tag) => (
                          <span
                            key={`${image.id}-${tag}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {!isLoading && !error && filteredImages.length === 0 && (
            <p className="empty-message">No matching images found.</p>
          )}
        </>
      )}

      {selectedImage && selectedImage.imageURLs.length > 0 && (

        <div className="modal-backdrop"
        role="presentation"
        onClick={closeImageViewer}
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
              onClick={closeImageViewer}
            >
              ×
            </button>

            <div className="modal-image-wrapper">
              {selectedImage.imageURLs.length > 1 && (
                <button className="image-navigation previous"
                type="button"
                aria-label="Show previous image"
                onClick={showPreviousImage}
              >
                ‹
              </button>
              )}

              <img className="modal-image" src={selectedImage.imageURLs[selectImageIndex]}
              alt={`${selectedImage.title} ${selectImageIndex + 1}`}
              />

              {selectedImage.imageURLs.length > 1 && (
                <button className="image-navigation next"
                type="button"
                aria-label="Show next image"
                onClick={showNextImage}
              >
                ›
              </button>
              )}
            </div>

            {selectedImage.imageURLs.length > 1 && (
              <p className="modal-image-counter">
                {selectImageIndex +1} of{" "}
                {selectedImage.imageURLs.length}
              </p>
            )}

            <h2>{selectedImage.title}</h2>
            <p>{selectedImage.description}</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
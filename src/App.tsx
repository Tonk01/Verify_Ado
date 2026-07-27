import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Admin from "./pages/Admin";
import type { AuthResponse, clientPrincipal } from "./types/AuthUser";
import type { ImageItem } from "./types/ImageItem";

type Page = "gallery" | "admin";

function App() {
  const [page, setPage] = useState<Page>("gallery");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<ImageItem | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [user, setUser] = useState<clientPrincipal | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50, });

  const isAdmin = user?.userRoles.includes("admin") ?? false;

useEffect(() => {
  async function loadUser() {
    try {
      const response = await fetch("/.auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Authentication request failed: ${response.status}`,
        );
      }

      const data = (await response.json()) as AuthResponse;

      console.log("Authentication response:", data);

      setUser(data.clientPrincipal ?? null);
    } catch (error) {
      console.error("Unable to load authentication state:", error);
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }

  void loadUser();
}, []);

  useEffect(() => {
    async function loadImages() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("http://localhost:7071/api/images");

        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status}`,
          );
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

  useEffect(() => {
    if (page === "admin" && !isAdmin && !isAuthLoading) {
      setPage("gallery");
    }
  }, [page, isAdmin, isAuthLoading]);

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
    setSelectedImageIndex(0);
  }

  function showPreviousImage() {
    if (!selectedImage) {
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
    if (!selectedImage) {
      return;
    }

    setSelectedImageIndex((currentIndex) => {
      if (
        currentIndex ===
        selectedImage.imageURLs.length - 1
      ) {
        return 0;
      }

      return currentIndex + 1;
    });
  }

  function handleZoomMove( event: React.MouseEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    const bounds = image.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) / bounds.width) * 100;

    const y =
      ((event.clientY - bounds.top) / bounds.height) * 100;

    setZoomPosition({ x, y });
  }

  const filteredImages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      return images;
    }

    return images.filter((image) => {
      const searchableText = [
        image.title,
        image.description,
        image.category,
        ...image.tags,
      ]
        .join(" ")
        .toLowerCase();

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

        {isAdmin && (
          <button
            type="button"
            className={page === "admin" ? "active" : ""}
            onClick={() => setPage("admin")}
          >
            Admin
          </button>
        )}

        {!isAuthLoading && !user && (
          <a
            className="auth-link"
            href="/.auth/login/aad?post_login_redirect_uri=/"
          >
            Sign in
          </a>
        )}

        {!isAuthLoading && user && (
          <a
            className="auth-link"
            href="/.auth/logout?post_logout_redirect_uri=/"
          >
            Sign out
          </a>
        )}
      </nav>

      {page === "admin" && isAdmin ? (
        <Admin onAddImage={handleAddImage} />
      ) : (
        <>
          <header className="page-header">
            <p>Search uploaded images.</p>

            <input
              className="search-input"
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </header>

          {isLoading && (
            <p className="empty-message">
              Loading images...
            </p>
          )}

          {error && (
            <p className="error-message">{error}</p>
          )}

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

                      {image.description && (
                        <p>{image.description}</p>
                      )}

                      {image.imageURLs.length > 1 && (
                        <p className="image-count">
                          {image.imageURLs.length} images
                        </p>
                      )}

                      {image.tags.length > 0 && (
                        <div className="tag-list">
                          {image.tags.map((tag) => (
                            <span
                              key={`${image.id}-${tag}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {!isLoading &&
            !error &&
            filteredImages.length === 0 && (
              <p className="empty-message">
                No matching images found.
              </p>
            )}
        </>
      )}

      {selectedImage &&
        selectedImage.imageURLs.length > 0 && (
          <div
            className="modal-backdrop"
            role="presentation"
            onClick={closeImageViewer}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-label={selectedImage.title}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                className="close-button"
                type="button"
                aria-label="Close image viewer"
                onClick={closeImageViewer}
              >
              
              </button>

              <div className="modal-image-wrapper">
                {selectedImage.imageURLs.length > 1 && (
                  <button
                    className="image-navigation previous"
                    type="button"
                    aria-label="Show previous image"
                    onClick={showPreviousImage}
                  >
                    ‹
                  </button>
                )}

                <div
                  className="inspection-viewport"
                  onClick={() => { setIsZoomed((current) => !current); 
                  }}

                  onMouseMove={(event) => {
                    const bounds =
                      event.currentTarget.getBoundingClientRect();

                    const x =
                      ((event.clientX - bounds.left) / bounds.width) * 100;

                    const y =
                      ((event.clientY - bounds.top) / bounds.height) * 100;

                    setZoomPosition({
                      x: Math.max(0, Math.min(100, x)),
                      y: Math.max(0, Math.min(100, y)),
                    });
                  }}
                >
                  <img
                    className={`inspection-image ${
                      isZoomed ? "zoomed" : ""
                    }`}
                    src={selectedImage.imageURLs[selectedImageIndex]}
                    alt={`${selectedImage.title} ${
                      selectedImageIndex + 1
                    }`}
                    style={{
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                  />
                </div>

                {selectedImage.imageURLs.length > 1 && (
                  <button
                    className="image-navigation next"
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
                  {selectedImageIndex + 1} of{" "}
                  {selectedImage.imageURLs.length}
                </p>
              )}

              <h2>{selectedImage.title}</h2>

              {selectedImage.description && (
                <p>{selectedImage.description}</p>
              )}
            </div>
          </div>
        )}
    </main>
  );
}

export default App;
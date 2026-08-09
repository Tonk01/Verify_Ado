import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Admin from "./pages/Admin";
import type { AuthResponse, clientPrincipal } from "./types/AuthUser";
import type { ImageItem } from "./types/ImageItem";

type Page = "gallery" | "admin";



type FilterOption = {
  label: string;
  tag: string;
  imageURL: string;
};

const filterOptions: FilterOption[] = [
  {
    label: "5th Anniversary",
    tag: "5th Anniversary",
    imageURL: "/filter_images/5thani.jpg",
  },
  {
    label: "Adobum",
    tag: "Adobum",
    imageURL: "/filter_images/Adobum_poster.jpg",
  },
  {
    label: "Adoroza",
    tag: "Adoroza",
    imageURL: "/filter_images/Adoroza.png",
  },
  {
    label: "Adotomy",
    tag: "Adotomy",
    imageURL: "/filter_images/Adotomy.jpg",
  },
  {
    label: "Ao",
    tag: "Ao",
    imageURL: "/filter_images/Ao.webp",
  },
  {
    label: "Campanella",
    tag: "Campanella",
    imageURL: "/filter_images/Campanella.jpg",
  },
  {
    label: "Cd",
    tag: "Cd",
    imageURL: "/filter_images/Adobum_cd.webp",
  },
  {
    label: "DokiDoki",
    tag: "DokiDoki",
    imageURL: "/filter_images/DokiDoki.jpg",
  },
  {
    label: "EXPO2025",
    tag: "EXPO2025",
    imageURL: "/filter_images/EXPO2025.jpg",
  },
  {
    label: "Figure",
    tag: "Figure",
    imageURL: "/filter_images/Ado_figure.jpg",
  },
  {
    label: "Gacha",
    tag: "Gacha",
    imageURL: "/filter_images/Gacha.jpg",
  },
  {
    label: "Georgia",
    tag: "Georgia",
    imageURL: "/filter_images/Georgia.jpg",
  },
  {
    label: "Hibana",
    tag: "Hibana",
    imageURL: "/filter_images/Ado_hibana.png",
  },
  {
    label: "DokiDoki",
    tag: "DokiDoki",
    imageURL: "/filter_images/DokiDoki.jpg",
  },
  {
    label: "Kigeki",
    tag: "Kigeki",
    imageURL: "/filter_images/Kigeki.jpg",
  },
  {
    label: "Kyougen",
    tag: "Kyougen",
    imageURL: "/filter_images/Kyougen.png",
  },
   {
    label: "Lollapalooza",
    tag: "Lollapalooza",
    imageURL: "/filter_images/lolla.jpg",
  },
  {
    label: "Mars",
    tag: "Mars",
    imageURL: "/filter_images/Mars.jpg",
  },
  {
    label: "Mirage",
    tag: "Mirage",
    imageURL: "/filter_images/Mirage.jpg",
  },
  {
    label: "Mona Lisa",
    tag: "Mona Lisa",
    imageURL: "/filter_images/Mona_lisa.webp",
  },
  {
    label: "Plushie",
    tag: "Plushie",
    imageURL: "/filter_images/Plushie.jpg",
  },
  {
    label: "Round1",
    tag: "Round1",
    imageURL: "/filter_images/Round1.jpg",
  },
  {
    label: "Shinzou",
    tag: "Shinzou",
    imageURL: "/filter_images/Shinzou.jpg",
  },
  {
    label: "Uta",
    tag: "Uta",
    imageURL: "/filter_images/Uta.jpg",
  },
  {
    label: "Vinyl",
    tag: "Vinyl",
    imageURL: "/filter_images/Vivarium_vinyl.webp",
  },
  {
    label: "Vivarium",
    tag: "Vivarium",
    imageURL: "/filter_images/Vivarium.png",
  },
  {
    label: "Yodaka",
    tag: "Yodaka",
    imageURL: "/filter_images/Yodaka.jpg",
  },
  {
    label: "Zanmu",
    tag: "Zanmu",
    imageURL: "/filter_images/Zanmu.png",
  },
  {
    label: "Zipangu",
    tag: "Zipangu",
    imageURL: "/filter_images/Zipangu.jpg",
  },
];


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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [selectedTag, setSelectedTag] = useState("");

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
    if (!selectedImage?.imageURLs.length)
      return;


    const urls = selectedImage.imageURLs
    const total = urls.length

    const previousIndex = (selectedImageIndex - 1 + total) % total;

    const nextIndex = (selectedImageIndex + 1) % total;

    const urlsToPreload = [
      urls[previousIndex],
      urls[selectedImageIndex],
      urls[nextIndex],
    ];

    urlsToPreload.forEach((url) => {
      const preloadImage = new Image();
      preloadImage.src = url;
    });
  }, [selectedImage, selectedImageIndex]);

  useEffect(() => {
    async function loadImages() {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/images");

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
    setIsLightboxOpen(false);
    setIsZoomed(false);
  }

  function closeImageViewer() {
    setSelectedImage(null);
    setSelectedImageIndex(0);
    setIsLightboxOpen(false);
    setIsZoomed(false);
  }

  function openFocusedViewer() {
    setIsLightboxOpen(true);
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  }

  function closeFocusedViewer() {
    setIsLightboxOpen(false);
    setIsZoomed(false);
    setZoomPosition({ x: 50, y: 50 });
  }

  function selectImage(index: number) {
    setSelectedImageIndex(index);
    setIsZoomed(false)
    setZoomPosition({ x: 50, y: 50 });
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

  const filteredImages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return images.filter((image) => {
      const matchesTag = !selectedTag || image.tags?.includes(selectedTag)

      const searchableText = [
        image.title,
        image.description,
        image.category,
        ...image.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchableText.includes(search)

      return matchesTag && matchesSearch;
    });
  }, [images, searchTerm, selectedTag]);


  // view
  return (
    <main className="app">

      {page === "admin" && isAdmin ? (
        <Admin onAddImage={handleAddImage} />
      ) : (
        <>

          <div className="gallery-layout">
            <aside className="filter-sidebar">
              <div className="filter-sidebar-header">
                <h2>Filter</h2>

                {selectedTag && (
                  <button type="button" onClick={() => setSelectedTag("")}
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="filter-sidebar-list">
                {filterOptions.map((option) => (
                  <button
                    key={option.tag}
                    className={`filter-card ${selectedTag === option.tag ? "active" : ""
                      }`}
                    type="button"
                    onClick={() => setSelectedTag(option.tag)}>

                    <img
                      src={option.imageURL}
                      alt=""
                    />

                    <strong>{option.label}</strong>
                  </button>
                ))}
              </div>
            </aside>

            <div className="gallery-content">
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
              <header className="page-header">
                <p>Search uploaded images</p>

                <input
                  className="search-input"
                  type="search"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
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
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="missing-image">
                            No Image Available
                          </div>
                        )}

                        <div className="image-card-content">
                          <h2>{image.title}</h2>

                          {image.description && (
                            <p>{image.description}</p>
                          )}

                          {image.imageURLs.length >= 1 && (
                            <p className="image-count">
                              {image.imageURLs.length} images
                            </p>
                          )}

                          {image.tags.length >= 1 && (
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

              {!isLoading && !error && filteredImages.length === 0 && (
                <p className="empty-message">
                  No matching images found
                </p>
              )}
            </div>

              <aside className="community-sidebar">

                <a className="discord-link"
                  href="https://discord.gg/CnRXN5y2u"
                  target="_blank"
                  rel="noopener noreferrer"
                > Adocord
                </a>

                <div className="contributors">
                  <h3> Special Thanks to </h3>
                  <p> Jamwolf06 </p>
                  <p> Dark </p>
                  <p> Corpses </p>
                  <p> Jammy Duel </p>
                  <p> CaptainFroggi </p>
                  <p> Tasu </p>
                  <p> Swoo </p>
                  <p> Poi </p>
                  <p> Chrislime </p>
                </div>

                <br></br>
                <h4> For contributing images! </h4>
              </aside>
          </div>

          {selectedImage && selectedImage.imageURLs.length > 0 && (
            <>
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
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    className="close-button"
                    type="button"
                    aria-label="Close image viewer"
                    onClick={closeImageViewer}
                  >
                    ×
                  </button>

                  <div className="modal-image-wrapper">
                    {selectedImage.imageURLs.length >= 1 && (
                      <button
                        className="image-navigation previous"
                        type="button"
                        aria-label="Show previous image"
                        onClick={showPreviousImage}
                      >
                        ‹
                      </button>
                    )}

                    <div className="inspection-viewport">
                      <button
                        className="inspection-image-button"
                        type="button"
                        aria-label="Open focused image viewer"
                        onClick={openFocusedViewer}
                      >
                        <img
                          className="inspection-image"
                          src={
                            selectedImage.imageURLs[
                            selectedImageIndex
                            ]
                          }
                          alt={`${selectedImage.title} ${selectedImageIndex + 1
                            }`}
                        />
                      </button>
                    </div>

                    {selectedImage.imageURLs.length >= 1 && (
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

                  {selectedImage.imageURLs.length >= 1 && (
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

              {isLightboxOpen && (
                <div
                  className="focused-lightbox-backdrop"
                  role="presentation"
                  onClick={closeFocusedViewer}
                >
                  <div
                    className="focused-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${selectedImage.title} focused viewer`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="focused-lightbox-close"
                      type="button"
                      aria-label="Close focused image viewer"
                      onClick={closeFocusedViewer}
                    >
                      ×
                    </button>

                    {selectedImage.imageURLs.length >= 1 && (
                      <aside
                        className="focused-thumbnails"
                        aria-label="Image thumbnails"
                      >
                        {selectedImage.imageURLs.map(
                          (imageURL, index) => (
                            <button
                              key={`${imageURL}-${index}`}
                              className={
                                selectedImageIndex === index
                                  ? "focused-thumbnail active"
                                  : "focused-thumbnail"
                              }
                              type="button"
                              aria-label={`Show image ${index + 1}`}
                              onClick={() => selectImage(index)}
                            >
                              <img src={imageURL} alt="" />
                            </button>
                          ),
                        )}
                      </aside>
                    )}

                    <div className={`focused-image-area ${isZoomed ? "zoom-active" : ""}`}

                      onClick={() => {
                        if (!isZoomed) {
                          return;
                        }

                        setIsZoomed(false);
                        setZoomPosition({ x: 50, y: 50 })
                      }}

                      onMouseMove={(event) => {
                        if (!isZoomed) {
                          return;
                        }

                        const bounds = event.currentTarget.getBoundingClientRect();

                        const Px = ((event.clientX - bounds.left) / bounds.width)
                        const Py = ((event.clientY - bounds.top) / bounds.height)

                        const x = 0 + Px * 100
                        const y = -6 + Py * 110

                        setZoomPosition({
                          x: Math.max(0, Math.min(100, x)),
                          y: Math.max(-6, Math.min(110, y)),
                        });
                      }}
                    >

                      {selectedImage.imageURLs.length >= 1 && (
                        <button
                          className="focused-navigation previous"
                          type="button"
                          aria-label="Show previous image"
                          onClick={showPreviousImage}
                        >
                          ‹
                        </button>
                      )}

                      <button
                        className={`focused-image-button ${isZoomed ? "zoomed" : ""
                          }`}
                        type="button"
                        aria-label={
                          isZoomed
                            ? "Return image to normal size"
                            : "Inspect image"
                        }

                        onClick={(event) => {
                          event.stopPropagation();

                          if (!isZoomed) {
                            setIsZoomed(true);
                          } else {
                            setIsZoomed(false);
                            setZoomPosition({ x: 50, y: 50 });
                          }
                        }}
                      >
                        <img
                          className="focused-main-image"
                          src={
                            selectedImage.imageURLs[
                            selectedImageIndex
                            ]
                          }
                          alt={`${selectedImage.title} ${selectedImageIndex + 1
                            }`}
                          style={{
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }}
                        />
                      </button>

                      {selectedImage.imageURLs.length >= 1 && (
                        <button
                          className="focused-navigation next"
                          type="button"
                          aria-label="Show next image"
                          onClick={showNextImage}
                        >
                          ›
                        </button>
                      )}
                    </div>

                    <p className="focused-image-counter">
                      {selectedImageIndex + 1} of{" "}
                      {selectedImage.imageURLs.length}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}

export default App;
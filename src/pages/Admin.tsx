import AdminForm from "../components/AdminForm";
import type { ImageItem } from "../types/ImageItem"


type AdminProps = {
    onAddImage: (image: ImageItem) => void;
};

function Admin({ onAddImage }: AdminProps) {
    return(
        <section className="admin-page">
            <h1> Add new Image </h1>

            <AdminForm onAddImage={onAddImage}/>
        </section>
    );
}

export default Admin;
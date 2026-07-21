import AdminForm, { type NewImage } from "../components/AdminForm";

type AdminProps = {
    onAddImage: (image: NewImage) => void;
};

function Admin({ onAddImage }: AdminProps) {
    return(
        <section className="admin-page">
            <h1> Add new Image </h1>
            <p> Add an image and searchable information </p>

            <AdminForm onAddImage={onAddImage}/>
        </section>
    );
}

export default Admin;
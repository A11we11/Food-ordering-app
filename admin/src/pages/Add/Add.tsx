import "./Add.css";

interface AddProps {
  rows: number;
}

const Add: React.FC<AddProps> = (rows) => {
  return (
    <div className="add">
      <form action="flex-col">
        <div className="add-img-upload flex-col">
          <p>Upload Image</p>
          <label htmlFor="image">
            <img src="" alt="" />
          </label>
          <input type="file" id="image" hidden required />
        </div>
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input type="text" name="name" placeholder="Type here" />
        </div>
        <div className="add-product-description">
          <p>Product description</p>
          <textarea
            name="description"
            rows="6"
            placeholder="Write content here"
            required
          ></textarea>
        </div>
      </form>
    </div>
  );
};

export default Add;

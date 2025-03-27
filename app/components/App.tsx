"use client";
import { useState } from "react";

const App = () => {
  const [formData, setFormData] = useState({
    text1: "",
    text2: "",
    text3: "",
    product: "",
    point: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form style={{ width: '500px' }}>
        <div style={{ marginBottom: '20px' }}>
          <select name="product" value={formData.product} onChange={handleChange}>
            <option value="">Select product</option>
            <option value="1">Product 1</option>
            <option value="2">Product 2</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <textarea 
            name="text1"
            rows={4} 
            cols={50}
            value={formData.text1}
            onChange={handleChange}
            placeholder="Text field 1"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <textarea 
            name="text2"
            rows={4} 
            cols={50}
            value={formData.text2}
            onChange={handleChange}
            placeholder="Text field 2"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <textarea 
            name="text3"
            rows={4} 
            cols={50}
            value={formData.text3}
            onChange={handleChange}
            placeholder="Text field 3"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <select name="point" value={formData.point} onChange={handleChange}>
            <option value="">Select point</option>
            <option value="1">Point 1</option>
            <option value="2">Point 2</option>
            <option value="3">Point 3</option>
          </select>
        </div>
      </form>
    </div>
  );
};

export default App;

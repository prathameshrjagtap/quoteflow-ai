import { useState } from "react";

export default function CreateQuote() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [items, setItems] = useState([
    {
      itemName: "",
      quantity: 1,
      price: 0,
    },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    setItems(updatedItems);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;

    const updatedItems = items.filter((_, i) => i !== index);

    setItems(updatedItems);
  };

  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );

  const gst = subtotal * 0.18;

  const grandTotal = subtotal + gst;

  return (
    <div className="max-w-5xl">
      <h2 className="text-3xl font-bold">Create Quote</h2>

      <p className="text-slate-400 mt-2 mb-8">
        Generate professional quotations.
      </p>

      {/* Customer Information */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="text-xl font-semibold mb-6">Customer Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />

          <input
            type="email"
            placeholder="Customer Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />

          <input
            type="text"
            placeholder="Customer Phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />
        </div>
      </div>

      {/* Quote Items */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Quote Items</h3>

          <button
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={item.itemName}
                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
              />

              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", Number(e.target.value))
                }
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
              />

              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, "price", Number(e.target.value))
                }
                className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
              />

              <div className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 flex items-center">
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>

              <button
                onClick={() => removeItem(index)}
                className="bg-red-600 hover:bg-red-700 rounded-lg px-4 py-3"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
        <h3 className="text-xl font-semibold mb-6">Quote Summary</h3>

        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>

          <div className="border-t border-slate-700 pt-4 flex justify-between font-bold text-2xl">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const FixedAsset = () => {
  const [assets, setAssets] = useState([
    { id: 1, assetCode: 'AST001', assetName: 'School Bus', category: 'Vehicle', purchaseDate: '2020-01-15', purchaseCost: 50000, currentValue: 35000, depreciation: 15000, status: 'Active' },
    { id: 2, assetCode: 'AST002', assetName: 'Computer Lab Equipment', category: 'Equipment', purchaseDate: '2021-06-20', purchaseCost: 25000, currentValue: 18000, depreciation: 7000, status: 'Active' },
    { id: 3, assetCode: 'AST003', assetName: 'Office Furniture', category: 'Furniture', purchaseDate: '2019-03-10', purchaseCost: 15000, currentValue: 8000, depreciation: 7000, status: 'Active' },
  ]);

  const [formData, setFormData] = useState({
    assetCode: '',
    assetName: '',
    category: '',
    purchaseDate: '',
    purchaseCost: '',
    depreciationRate: '',
    location: '',
    description: '',
    status: 'Active'
  });

  const [editingId, setEditingId] = useState(null);

  const categories = ['Vehicle', 'Equipment', 'Furniture', 'Building', 'Land', 'Other'];
  const statuses = ['Active', 'Disposed', 'Under Maintenance'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateCurrentValue = (purchaseCost, purchaseDate, depreciationRate) => {
    if (!purchaseCost || !purchaseDate || !depreciationRate) return 0;
    const cost = parseFloat(purchaseCost);
    const rate = parseFloat(depreciationRate) / 100;
    const years = (new Date() - new Date(purchaseDate)) / (365.25 * 24 * 60 * 60 * 1000);
    const depreciation = cost * rate * years;
    return Math.max(0, cost - depreciation);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.assetCode || !formData.assetName || !formData.category || !formData.purchaseDate || !formData.purchaseCost) {
      alert('Please fill in all required fields.');
      return;
    }

    const currentValue = calculateCurrentValue(formData.purchaseCost, formData.purchaseDate, formData.depreciationRate || 10);
    const depreciation = parseFloat(formData.purchaseCost) - currentValue;

    if (editingId) {
      setAssets(prev => prev.map(a => 
        a.id === editingId ? { ...a, ...formData, purchaseCost: parseFloat(formData.purchaseCost), currentValue, depreciation } : a
      ));
      setEditingId(null);
    } else {
      const newId = Math.max(...assets.map(a => a.id), 0) + 1;
      setAssets([...assets, {
        id: newId,
        ...formData,
        purchaseCost: parseFloat(formData.purchaseCost),
        currentValue,
        depreciation
      }]);
    }

    handleClear();
  };

  const handleEdit = (asset) => {
    setFormData({
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      category: asset.category,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost.toString(),
      depreciationRate: '10',
      location: asset.location || '',
      description: asset.description || '',
      status: asset.status
    });
    setEditingId(asset.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleClear = () => {
    setFormData({
      assetCode: '',
      assetName: '',
      category: '',
      purchaseDate: '',
      purchaseCost: '',
      depreciationRate: '',
      location: '',
      description: '',
      status: 'Active'
    });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Fixed Asset</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/finance" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Finance Entries</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Fixed Asset</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Fixed Asset' : 'Add New Fixed Asset'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Asset Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="assetCode"
                value={formData.assetCode}
                onChange={handleChange}
                placeholder="AST001"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                placeholder="Enter asset name"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Purchase Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Purchase Cost (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="purchaseCost"
                value={formData.purchaseCost}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Depreciation Rate (%)
              </label>
              <input
                type="number"
                name="depreciationRate"
                value={formData.depreciationRate}
                onChange={handleChange}
                placeholder="10"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div className="flex items-end gap-2">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Assets List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Fixed Assets Register</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Asset Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Asset Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Purchase Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Purchase Cost</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Depreciation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No assets found. Add one above.
                  </td>
                </tr>
              ) : (
                assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{asset.assetCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{asset.assetName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{asset.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{asset.purchaseCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{asset.currentValue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{asset.depreciation.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        asset.status === 'Active' ? 'bg-green-100 text-green-800' :
                        asset.status === 'Under Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default FixedAsset;

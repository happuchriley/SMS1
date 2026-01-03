import React, { useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import billingService from '../../services/billingService';
import { useModal } from '../../components/ModalProvider';

const ManageOtherFees = () => {
  const { toast, showDeleteModal } = useModal();
  const [fees, setFees] = useState([]);
  const [, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    description: '',
    status: 'Active'
  });

  const [editingId, setEditingId] = useState(null);

  const loadFees = useCallback(async () => {
    try {
      setLoading(true);
      const allFees = await billingService.getAllOtherFees();
      setFees(allFees);
    } catch (error) {
      console.error('Error loading other fees:', error);
      toast.showError('Failed to load other fees');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await billingService.updateOtherFee(editingId, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        toast.showSuccess('Other fee updated successfully');
      } else {
        await billingService.createOtherFee({
          ...formData,
          amount: parseFloat(formData.amount)
        });
        toast.showSuccess('Other fee created successfully');
      }
      await loadFees();
      setFormData({ name: '', amount: '', description: '', status: 'Active' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving other fee:', error);
      toast.showError(error.message || 'Failed to save other fee');
    }
  };

  const handleEdit = (fee) => {
    setFormData({ name: fee.name, amount: fee.amount.toString(), description: fee.description || '', status: fee.status || 'Active' });
    setEditingId(fee.id);
  };

  const handleDelete = (id) => {
    showDeleteModal({
      title: 'Delete Other Fee',
      message: 'Are you sure you want to delete this fee? This action cannot be undone.',
      itemName: fees.find(f => f.id === id)?.name || 'this fee',
      onConfirm: async () => {
        try {
          await billingService.deleteOtherFee(id);
          toast.showSuccess('Other fee deleted successfully');
          await loadFees();
        } catch (error) {
          console.error('Error deleting other fee:', error);
          toast.showError(error.message || 'Failed to delete other fee');
        }
      }
    });
  };

  const handleCancel = () => {
    setFormData({ name: '', amount: '', description: '', status: 'Active' });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage Other Fees</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/fee-collection" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Fee Collection</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage Other Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Other Fee' : 'Add New Other Fee'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Fee Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter fee name"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Amount (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
                  onClick={handleCancel}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Fees List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Other Fees List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fee Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No fees found. Add one above.
                  </td>
                </tr>
              ) : (
                fees.map(fee => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fee.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fee.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{fee.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        fee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(fee)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id)}
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

export default ManageOtherFees;

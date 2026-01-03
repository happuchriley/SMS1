import React, { useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import academicService from '../../services/academicService';
import { useModal } from '../../components/ModalProvider';

const ReportsFootnote = () => {
  const { toast, showDeleteModal } = useModal();
  const [footnotes, setFootnotes] = useState([]);
  const [, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    symbol: '',
    text: ''
  });

  const [editingId, setEditingId] = useState(null);

  const loadFootnotes = useCallback(async () => {
    try {
      setLoading(true);
      const allFootnotes = await academicService.getAllFootnotes();
      setFootnotes(allFootnotes);
    } catch (error) {
      console.error('Error loading footnotes:', error);
      toast.showError('Failed to load footnotes');
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
    if (!formData.symbol || !formData.text) {
      toast.showError('Please fill in all fields.');
      return;
    }

    try {
      if (editingId) {
        await academicService.updateFootnote(editingId, formData);
        toast.showSuccess('Footnote updated successfully');
      } else {
        await academicService.createFootnote(formData);
        toast.showSuccess('Footnote created successfully');
      }
      await loadFootnotes();
      setFormData({ symbol: '', text: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Error saving footnote:', error);
      toast.showError(error.message || 'Failed to save footnote');
    }
  };

  const handleEdit = (footnote) => {
    setFormData({ symbol: footnote.symbol, text: footnote.text });
    setEditingId(footnote.id);
  };

  const handleDelete = (id) => {
    showDeleteModal({
      title: 'Delete Footnote',
      message: 'Are you sure you want to delete this footnote? This action cannot be undone.',
      itemName: footnotes.find(f => f.id === id)?.text || 'this footnote',
      onConfirm: async () => {
        try {
          await academicService.deleteFootnote(id);
          toast.showSuccess('Footnote deleted successfully');
          await loadFootnotes();
        } catch (error) {
          console.error('Error deleting footnote:', error);
          toast.showError(error.message || 'Failed to delete footnote');
        }
      }
    });
  };

  const handleCancel = () => {
    setFormData({ symbol: '', text: '' });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Reports Footnote</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Reports & Assessment</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Reports Footnote</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Footnote' : 'Add New Footnote'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Symbol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="*"
                maxLength="5"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div className="sm:col-span-8">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="text"
                value={formData.text}
                onChange={handleChange}
                placeholder="Enter footnote text..."
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div className="sm:col-span-2 flex items-end gap-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
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

      {/* Footnotes List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Existing Footnotes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Text</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {footnotes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    No footnotes found. Add one above.
                  </td>
                </tr>
              ) : (
                footnotes.map(footnote => (
                  <tr key={footnote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{footnote.symbol}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{footnote.text}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(footnote)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(footnote.id)}
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

export default ReportsFootnote;

import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService, { BillItemData } from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface BillItemFormData {
  code: string;
  name: string;
  type: string;
  amount: string;
  taxable: boolean;
  active: boolean;
}


const BillItem: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [items, setItems] = useState<BillItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BillItemData | null>(null);
  const [formData, setFormData] = useState<BillItemFormData>({
    code: '',
    name: '',
    type: 'Mandatory',
    amount: '',
    taxable: false,
    active: true
  });

  const billTypes: string[] = ['Mandatory', 'Optional', 'Penalty'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const loadItems = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const allItems = await setupService.getAllBillItems();
      setItems(allItems);
    } catch (error) {
      console.error('Error loading bill items:', error);
      toast.showError('Failed to load bill items');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.id) {
        await setupService.updateBillItem(editingItem.id, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        toast.showSuccess('Bill item updated successfully');
      } else {
        await setupService.createBillItem({
          ...formData,
          amount: parseFloat(formData.amount)
        });
        toast.showSuccess('Bill item created successfully');
      }
      await loadItems();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving bill item:', error);
      toast.showError(error.message || 'Failed to save bill item');
    }
  };

  const handleEdit = (item: BillItemData): void => {
    setEditingItem(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      type: item.type || 'Mandatory',
      amount: String(item.amount || ''),
      taxable: item.taxable || false,
      active: item.active !== undefined ? item.active : true
    });
    setShowModal(true);
  };

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Bill Item',
      message: 'Are you sure you want to delete this bill item? This action cannot be undone.',
      itemName: items.find(i => i.id === id)?.name || 'this bill item',
      onConfirm: async () => {
        try {
          await setupService.deleteBillItem(id);
          toast.showSuccess('Bill item deleted successfully');
          await loadItems();
        } catch (error: any) {
          console.error('Error deleting bill item:', error);
          toast.showError(error.message || 'Failed to delete bill item');
        }
      }
    });
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ code: '', name: '', type: 'Mandatory', amount: '', taxable: false, active: true });
  };

  const handleAddNew = (): void => {
    setEditingItem(null);
    setFormData({ code: '', name: '', type: 'Mandatory', amount: '', taxable: false, active: true });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Bill Item</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Bill Item</span>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Add New Bill Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Taxable</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No bill items found. Add one above.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'Mandatory' ? 'bg-red-100 text-red-800' :
                        item.type === 'Optional' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{item.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.taxable ? <i className="fas fa-check text-green-600"></i> : <i className="fas fa-times text-red-600"></i>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => item.id && handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={!item.id}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingItem ? 'Edit Bill Item' : 'Add New Bill Item'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Bill Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Bill Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Bill Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    >
                      {billTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
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
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="taxable"
                      checked={formData.taxable}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                    />
                    <span className="text-sm text-gray-900 font-medium">Taxable</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                    />
                    <span className="text-sm text-gray-900 font-medium">Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
                  >
                    {editingItem ? 'Update' : 'Add'} Bill Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BillItem;


/**
 * SchedulerItems Component
 * Item inventory management with inline editing
 */

import { useState, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SchedulerItem, ResourceType, ServiceStatus } from '../../types/scheduler';
import { Button, Input, Textarea } from '../ui';
import { updateItem } from '../../services/scheduler/itemService';
import toast from 'react-hot-toast';

interface SchedulerItemsProps {
  items: SchedulerItem[];
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SchedulerItem | null;
  onSave: (item: SchedulerItem) => Promise<void>;
}

const getResourceIcon = (resourceType: ResourceType | string): string => {
  switch (resourceType?.toUpperCase()) {
    case 'GUEST_SUITE':
      return '🏠';
    case 'SKY_LOUNGE':
      return '🌆';
    case 'GEAR_SHED':
      return '🎿';
    default:
      return '📦';
  }
};

const getResourceColor = (resourceType: ResourceType | string): string => {
  switch (resourceType?.toUpperCase()) {
    case 'GUEST_SUITE':
      return 'border-l-4 border-neuro-yellow';
    case 'SKY_LOUNGE':
      return 'border-l-4 border-neuro-blue';
    case 'GEAR_SHED':
      return 'border-l-4 border-neuro-mint';
    default:
      return 'border-l-4 border-neuro-lavender';
  }
};

const getServiceStatusClass = (status: ServiceStatus | string): string => {
  const normalizedStatus = status?.toLowerCase().replace(/_/g, ' ');
  return normalizedStatus === 'in service'
    ? 'bg-neuro-mint text-green-800'
    : 'bg-neuro-peach text-red-800';
};

const EditModal = ({ isOpen, onClose, item, onSave }: EditModalProps) => {
  const [formData, setFormData] = useState<Partial<SchedulerItem>>({
    item: item?.item || '',
    description: item?.description || '',
    service_status: item?.service_status || 'In Service',
    service_notes: item?.service_notes || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const updatedItem: SchedulerItem = {
        ...item,
        ...formData,
      } as SchedulerItem;
      await onSave(updatedItem);
      onClose();
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-neuro-element rounded-neuro-xl shadow-neuro-hover w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/20 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neuro-primary">Edit Item</h2>
            <button
              onClick={onClose}
              className="text-neuro-secondary hover:text-neuro-primary text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Item Name <span className="text-neuro-peach">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.item}
                  onChange={(e) =>
                    setFormData({ ...formData, item: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neuro-secondary mb-2">
                  Service Status
                </label>
                <select
                  className="w-full px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
                  value={formData.service_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_status: e.target.value as ServiceStatus,
                    })
                  }
                >
                  <option value="In Service">In Service</option>
                  <option value="Not In Service">Not In Service</option>
                </select>
              </div>

              {formData.service_status === 'Not In Service' && (
                <div>
                  <label className="block text-sm font-medium text-neuro-secondary mb-2">
                    Service Notes
                  </label>
                  <Textarea
                    value={formData.service_notes}
                    onChange={(e) =>
                      setFormData({ ...formData, service_notes: e.target.value })
                    }
                    rows={2}
                    placeholder="Reason for out-of-service status..."
                  />
                </div>
              )}

              <div className="bg-white/10 rounded-neuro-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neuro-secondary">Item ID:</span>
                  <span className="text-neuro-primary font-medium">
                    {item.item_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neuro-secondary">Resource Type:</span>
                  <span className="text-neuro-primary font-medium">
                    {item.resource_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const SchedulerItems = ({ items }: SchedulerItemsProps) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [editingItem, setEditingItem] = useState<SchedulerItem | null>(null);

  // Filter items
  const filteredItems = useMemo(() => {
    let filtered = items;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.item.toLowerCase().includes(searchLower) ||
          item.item_id.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.resource_type?.toUpperCase() === typeFilter.toUpperCase());
    }

    return filtered.sort((a, b) => {
      // Sort by resource type, then by item name
      if (a.resource_type !== b.resource_type) {
        return a.resource_type.localeCompare(b.resource_type);
      }
      return a.item.localeCompare(b.item);
    });
  }, [items, search, typeFilter]);

  const handleSaveItem = async (item: SchedulerItem) => {
    try {
      await updateItem(item._docId, {
        item: item.item,
        description: item.description,
        service_status: item.service_status,
        service_notes: item.service_notes,
      });
      toast.success('Item updated successfully');
    } catch (error) {
      toast.error('Failed to update item');
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search items by name, ID, or description..."
          className="flex-1 px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-pressed border-none focus:outline-none focus:ring-2 focus:ring-neuro-blue/50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ResourceType | 'all')}
          className="px-4 py-2 rounded-neuro-md bg-neuro-element shadow-neuro-flat border-none focus:outline-none cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="GUEST_SUITE">Guest Suite</option>
          <option value="SKY_LOUNGE">Sky Lounge</option>
          <option value="GEAR_SHED">Gear Shed</option>
        </select>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-neuro-element rounded-neuro-xl shadow-neuro-flat">
          <p className="text-neuro-secondary">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item._docId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-neuro-xl bg-neuro-element shadow-neuro-flat hover:shadow-neuro-hover transition-all duration-300 ${getResourceColor(
                item.resource_type
              )}`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{getResourceIcon(item.resource_type)}</div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceStatusClass(
                    item.service_status
                  )}`}
                >
                  {item.service_status}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-neuro-primary mb-1">
                {item.item}
              </h3>
              <p className="text-xs text-neuro-secondary mb-3 font-mono">
                {item.item_id}
              </p>
              {item.description && (
                <p className="text-sm text-neuro-secondary mb-3">
                  {item.description}
                </p>
              )}
              {item.service_notes && (
                <div className="bg-neuro-peach/20 rounded-neuro-md p-2 mb-3">
                  <p className="text-xs text-neuro-primary">
                    <span className="font-semibold">Note:</span>{' '}
                    {item.service_notes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setEditingItem(item)}
                  className="px-4 py-2 rounded-neuro-md text-sm font-medium text-neuro-secondary hover:text-neuro-primary bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Edit
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-neuro-secondary text-center">
        Showing {filteredItems.length} of {items.length} item(s)
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  );
};

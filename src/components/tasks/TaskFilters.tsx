// src/components/tasks/TaskFilters.tsx
"use client";

interface Filters {
  status: string;
  priority: string;
  page: number;
}

interface TaskFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

interface FilterOption {
  value: string;
  label: string;
}

export default function TaskFilters({
  filters,
  onFilterChange,
}: TaskFiltersProps) {
  const statusOptions: FilterOption[] = [
    { value: "MY_TASKS", label: "My Tasks" },
    { value: "ALL", label: "All Tasks" },
    { value: "PENDING", label: "Pending" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const priorityOptions: FilterOption[] = [
    { value: "ALL", label: "All Priorities" },
    { value: "URGENT", label: "Urgent" },
    { value: "HIGH", label: "High" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LOW", label: "Low" },
  ];

  const handleStatusChange = (statusValue: string) => {
    onFilterChange({ ...filters, status: statusValue, page: 1 });
  };

  const handlePriorityChange = (priorityValue: string) => {
    onFilterChange({ ...filters, priority: priorityValue, page: 1 });
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filters.status === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Priority
          </label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePriorityChange(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  filters.priority === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

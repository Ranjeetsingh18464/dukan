import { ORDER_STATUSES } from '../../utils/constants';

const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderTimeline({ currentStatus }) {
  const currentIdx = steps.indexOf(currentStatus);

  return (
    <div className="space-y-4">
      {ORDER_STATUSES.filter(s => s.value !== 'cancelled').map((status, i) => {
        const isActive = i <= currentIdx;
        const isCurrent = steps[i] === currentStatus;
        return (
          <div key={status.value} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'} ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`} />
              {i < steps.length - 1 && <div className={`w-0.5 h-8 ${isActive ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
            </div>
            <div className="pb-6">
              <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{status.label}</p>
            </div>
          </div>
        );
      })}
      {currentStatus === 'cancelled' && (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-500" />
          </div>
          <p className="font-medium text-red-600">Cancelled</p>
        </div>
      )}
    </div>
  );
}

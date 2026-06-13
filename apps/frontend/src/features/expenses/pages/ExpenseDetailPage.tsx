import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { expensesApi } from '../expenses.api';
import { PageSpinner, Avatar, Badge } from '@components/ui';
import { formatCurrency } from '@utils/currency';
import { formatDate } from '@utils/date';

export default function ExpenseDetailPage() {
  const { expenseId = '' } = useParams();

  const { data: expense, isLoading } = useQuery({
    queryKey: ['expense', expenseId],
    queryFn:  () => expensesApi.getOne(expenseId),
  });

  if (isLoading) return <PageSpinner />;
  if (!expense)  return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
        <div>
          <Badge color="blue">{expense.category}</Badge>
          <h1 className="text-xl font-bold text-gray-900 mt-2">{expense.description}</h1>
          <p className="text-3xl font-bold text-primary-600 mt-1">{formatCurrency(expense.amount)}</p>
        </div>

        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Date</span>
            <span>{formatDate(expense.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid by</span>
            <span className="font-medium">{expense.paidBy?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Group</span>
            <span>{expense.group?.name}</span>
          </div>
        </div>

        {expense.notes && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            {expense.notes}
          </div>
        )}

        <div>
          <h2 className="font-semibold text-gray-800 mb-2">Split breakdown</h2>
          <div className="flex flex-col gap-2">
            {expense.splits?.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar name={s.user.name} size="xs" />
                  <span className="text-sm">{s.user.name}</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(s.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

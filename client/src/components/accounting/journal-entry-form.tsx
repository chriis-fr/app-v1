import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

const journalEntryLineSchema = z.object({
  accountId: z.string(),
  description: z.string(),
  debit: z.number().optional(),
  credit: z.number().optional(),
});

const journalEntrySchema = z.object({
  date: z.string(),
  reference: z.string(),
  description: z.string(),
  lines: z.array(journalEntryLineSchema).min(2),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface JournalEntryFormProps {
  accounts: Account[];
  onSubmit: (data: JournalEntryFormData) => Promise<void>;
  onCancel: () => void;
}

export function JournalEntryForm({ accounts, onSubmit, onCancel }: JournalEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      lines: [
        { accountId: '', description: '', debit: 0, credit: 0 },
        { accountId: '', description: '', debit: 0, credit: 0 },
      ],
    },
  });

  const lines = watch('lines');

  const addLine = () => {
    setValue('lines', [...lines, { accountId: '', description: '', debit: 0, credit: 0 }]);
  };

  const removeLine = (index: number) => {
    setValue('lines', lines.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: JournalEntryFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting journal entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
          <CardDescription>Create a new journal entry with multiple lines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                {...register('reference')}
                placeholder="JE-001"
              />
              {errors.reference && (
                <p className="text-sm text-red-500">{errors.reference.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Journal Lines</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </Button>
            </div>

            {lines.map((_, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-4 space-y-2">
                  <Label>Account</Label>
                  <Select
                    value={lines[index].accountId}
                    onValueChange={(value) => {
                      const newLines = [...lines];
                      newLines[index].accountId = value;
                      setValue('lines', newLines);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3 space-y-2">
                  <Label>Description</Label>
                  <Input
                    {...register(`lines.${index}.description`)}
                    placeholder="Line description"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Debit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`lines.${index}.debit`, { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label>Credit</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`lines.${index}.credit`, { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>

                <div className="col-span-1 pt-8">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {errors.lines && (
              <p className="text-sm text-red-500">{errors.lines.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Journal Entry'}
        </Button>
      </div>
    </form>
  );
} 
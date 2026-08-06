import type {
  Control,
  FieldErrors,
  UseFieldArrayReturn,
  UseFormRegister,
  UseFormWatch,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { FormField } from '../FormField';
import { Button } from '../ui/button';
import type { WeddingSiteFormData } from '../../lib/validations';

interface RegistrySectionProps {
  register: UseFormRegister<WeddingSiteFormData>;
  errors: FieldErrors<WeddingSiteFormData>;
  control: Control<WeddingSiteFormData>;
  watch: UseFormWatch<WeddingSiteFormData>;
  bankAccountsArray: UseFieldArrayReturn<
    WeddingSiteFormData,
    'bankAccounts',
    'id'
  >;
}

export function RegistrySection({
  register,
  errors,
  control,
  watch,
  bankAccountsArray,
}: RegistrySectionProps) {
  const registryEnabled = watch('registryEnabled');
  const {
    fields: bankFields,
    append: appendBank,
    remove: removeBank,
  } = bankAccountsArray;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gift Registry</CardTitle>
            <CardDescription>
              Add registry links or bank details
            </CardDescription>
          </div>
          <Controller
            name="registryEnabled"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Enabled</span>
              </label>
            )}
          />
        </div>
      </CardHeader>
      {registryEnabled && (
        <CardContent className="space-y-4">
          <FormField
            label="Section Title"
            name="registryTitle"
            register={register}
            errors={errors}
            required
          />

          <FormField
            label="Registry Information"
            name="registryText"
            placeholder="Add registry links or bank transfer details..."
            register={register}
            errors={errors}
            multiline
            rows={4}
          />

          <FormField
            label="Alamat hadiah fisik (opsional)"
            name="giftAddress"
            register={register}
            errors={errors}
            multiline
            rows={3}
            placeholder="Alamat penerima hadiah fisik"
          />

          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Rekening bank (opsional)</h4>
              <p className="text-sm text-muted-foreground">
                Data ini akan tampil sebagai kartu rekening di undangan.
              </p>
            </div>
            {bankFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-3 rounded-md bg-muted/40 p-3"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium">
                    Rekening {index + 1}
                  </h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBank(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <FormField
                    label="Nama bank"
                    name={'bankAccounts.' + index + '.bank'}
                    register={register}
                    errors={errors}
                    required
                  />
                  <FormField
                    label="Nomor rekening"
                    name={'bankAccounts.' + index + '.number'}
                    register={register}
                    errors={errors}
                    required
                  />
                  <FormField
                    label="Nama pemilik"
                    name={'bankAccounts.' + index + '.owner'}
                    register={register}
                    errors={errors}
                    required
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                appendBank({
                  bank: '',
                  number: '',
                  owner: '',
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah rekening
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

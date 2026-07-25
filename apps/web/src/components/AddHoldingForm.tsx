'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { createHolding, searchSchemes } from '@/lib/api-client';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { CreateHoldingPayload, createHoldingSchema } from '@/lib/schema';
import { MFScheme } from '@mintfolio/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IndianRupee, Loader2, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export default function AddHoldingForm() {
  const [schemeQuery, setSchemeQuery] = useState('');
  const debouncedQuery = useDebounce(schemeQuery, 300);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateHoldingPayload>({
    resolver: zodResolver(createHoldingSchema),
    mode: 'onTouched',
    defaultValues: {
      scheme_code: '',
      scheme_name: '',
      units: undefined,
      amount_invested: undefined,
    },
  });

  const { data } = useQuery({
    queryKey: ['search-scheme', debouncedQuery],
    queryFn: () => searchSchemes(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ['create-holding'],
    mutationFn: (payload: CreateHoldingPayload) => createHolding(payload),
    onSuccess: async () => {
      toast.success('Holding added successfully.');
      reset();
      setSchemeQuery('');
      await queryClient.invalidateQueries({ queryKey: ['user-holdings'] });
    },
    onError: (error) => {
      if (isAxiosError(error)) toast.error(error.response?.data.message);
      else toast.error('Something went wrong while trying to add holding.');
    },
  });

  const schemes: MFScheme[] = data?.data?.data ?? [];

  const submitForm: SubmitHandler<CreateHoldingPayload> = (data) => {
    mutate(data);
  };

  return (
    <Card className="h-fit w-full max-w-lg max-lg:mx-auto">
      <CardHeader>
        <CardTitle>Add Holding</CardTitle>
        <CardDescription>Add a mutual fund scheme to your portfolio</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
          <div>
            <Field>
              <FieldLabel>Scheme</FieldLabel>
              <Combobox
                items={schemes}
                onValueChange={(value) => {
                  const scheme = schemes.find((s) => String(s.schemeCode) === value);
                  if (scheme) {
                    setSchemeQuery(scheme.schemeName);
                    setValue('scheme_code', scheme.schemeCode.toString(), { shouldValidate: true });
                    setValue('scheme_name', scheme.schemeName, { shouldValidate: true });
                  }
                }}
              >
                <ComboboxInput
                  placeholder="Search mutual fund schemes..."
                  value={schemeQuery}
                  showTrigger={false}
                  onChange={(e) => {
                    setSchemeQuery(e.currentTarget.value);
                    setValue('scheme_code', '', { shouldValidate: true });
                    setValue('scheme_name', '', { shouldValidate: true });
                  }}
                >
                  <InputGroupAddon align="inline-start">
                    <SearchIcon />
                  </InputGroupAddon>
                </ComboboxInput>
                <ComboboxContent>
                  <ComboboxEmpty>No schemes found.</ComboboxEmpty>
                  <ComboboxList>
                    {(scheme: MFScheme) => (
                      <ComboboxItem key={scheme.schemeCode} value={String(scheme.schemeCode)}>
                        {scheme.schemeName}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
            <p className="mt-1 min-h-4 text-xs text-red-600">{errors.scheme_code?.message}</p>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-full">
              <Field>
                <FieldLabel>Invested Amount</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder="500"
                    {...register('amount_invested', {
                      onBlur: (e) => {
                        const parsed = parseFloat(e.target.value);
                        if (!isNaN(parsed)) e.target.value = String(parsed);
                      },
                    })}
                  />
                  <InputGroupAddon align="inline-start">
                    <IndianRupee />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
              <p className="mt-1 min-h-4 text-xs text-red-600">{errors.amount_invested?.message}</p>
            </div>

            <div className="w-full">
              <Field>
                <FieldLabel>Units</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder="10"
                    {...register('units', {
                      onBlur: (e) => {
                        const parsed = parseFloat(e.target.value);
                        if (!isNaN(parsed)) e.target.value = String(parsed);
                      },
                    })}
                  />
                </InputGroup>
              </Field>
              <p className="mt-1 min-h-4 text-xs text-red-600">{errors.units?.message}</p>
            </div>
          </div>

          <Button type="submit" className="w-full items-center gap-2">
            {isPending && <Loader2 className="animate-spin" />}
            {isPending ? 'Adding Holding' : 'Add Holding'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

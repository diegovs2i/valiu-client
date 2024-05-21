'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';

const formSchema = z.object({
  startAt: z.string(),
  endAt: z.string()
});

export default function TableBook({
  params: { id: tableId }
}: {
  params: { id: string };
}) {
  const [errors, setErrors] = useState<{ startAt?: string; endAt?: string }>(
    {}
  );

  const router = useRouter();
  const { toast } = useToast();

  const searchParams = useSearchParams();
  const date = searchParams.get('date');
  const searchReservedHours: string[] = searchParams.get('reservedHours')
    ? JSON.parse(searchParams.get('reservedHours')!)
    : [];

  const reservedHours: number[] = searchReservedHours
    ? searchReservedHours.map((hour) => Number(hour))
    : [];
  const openAt = Number(searchParams.get('openAt')!);
  const closeAt = Number(searchParams.get('closeAt')!);

  const startHours: number[] = [];
  const endHours: number[] = [];
  for (let i = openAt; i <= closeAt; i++) {
    if (reservedHours.includes(i)) continue;

    if (i !== openAt) {
      endHours.push(i);
    }

    if (i !== closeAt) {
      startHours.push(i);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startAt: `${startHours[0]}`,
      endAt: `${endHours[0]}`
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const startAt = Number(values.startAt);
    const endAt = Number(values.endAt);

    if (startAt >= endAt) {
      setErrors((prev) => ({
        ...prev,
        startAt: 'Reservation start at value must be lower than end at value',
        endAt: 'Reservation end at must be greater than start at value'
      }));
      return;
    }

    if (reservedHours.length) {
      for (let i = startAt; i < endAt; i++) {
        if (reservedHours.includes(i)) {
          setErrors((prev) => ({
            ...prev,
            startAt: `Table is already reserved at ${i}, please select other time slot`,
            endAt: `Table is already reserved at ${i}, please select other time slot`
          }));
          return;
        }
      }
    }

    const response = await fetch('/api/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId,
        date,
        startAt,
        endAt
      })
    });

    if (response.ok) {
      toast({
        duration: 2000,
        title: 'Your reservation was succesfully create',
        description: `It will be on ${date} from ${startAt} to ${endAt}`
      });
      setTimeout(() => {
        router.push('/tables');
      }, 2500);
    } else {
      toast({
        duration: 2000,
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem with your request.'
      });
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {[
            {
              name: 'startAt',
              label: 'Start at',
              hours: startHours
            },
            {
              name: 'endAt',
              label: 'End at',
              hours: endHours
            }
          ].map(({ name, label, hours }, i) => (
            <FormField
              key={i}
              control={form.control}
              name={name as 'startAt' | 'endAt'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={`${field.value}`}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${name} hours`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hours.map((hour, i) => (
                        <SelectItem key={i} value={`${hour}`}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[name as 'startAt' | 'endAt'] ? (
                    <FormMessage>
                      {errors[name as 'startAt' | 'endAt']}
                    </FormMessage>
                  ) : (
                    <></>
                  )}
                </FormItem>
              )}
            />
          ))}
          <div className="flex gap-5">
            <Button type="submit">Book</Button>
            <Button>
              <Link href="/">Go back</Link>
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}

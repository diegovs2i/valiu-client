'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const formSchema = z.object({
  targetDate: z.date(),
  seats: z.string()
});

const AMOUNT_OF_TABLES = 1;

type FiltersType = {
  seats: number;
  targetDate: string;
  skip: number;
  take: number;
};

type TableType = {
  id: string;
  seats: number;
  reservedHours: number[];
  restaurant: {
    name: string;
    openAt: number;
    closeAt: number;
  };
};

export default function Tables() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [filters, setFilters] = useState<FiltersType>({
    seats: 2,
    targetDate: new Date().toISOString().slice(0, 10),
    skip: 0,
    take: AMOUNT_OF_TABLES
  });
  const [filtered, setFiltered] = useState(false);
  const [noMoreTables, setNoMoreTables] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      targetDate: new Date(),
      seats: '2'
    }
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/tables/available', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
      signal: controller.signal
    })
      .then((res) => res.json())
      .then((res) => {
        setTables((prev: TableType[]) => {
          const previousTables = prev.filter(
            ({ seats }) => seats === filters.seats
          );
          const newTables = res.filter(
            (resTable: TableType) =>
              !previousTables.some((prevTable) => prevTable.id === resTable.id)
          );
          setNoMoreTables(!newTables.length);
          return [...previousTables, ...newTables];
        });
        setFiltered(() => true);
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        throw e;
      });

    return () => {
      controller.abort(controller.signal.reason);
    };
  }, [filters]);

  async function onSubmit({ seats, targetDate }: z.infer<typeof formSchema>) {
    setFilters({
      seats: Number(seats),
      targetDate: targetDate.toISOString().slice(0, 10),
      skip: 0,
      take: AMOUNT_OF_TABLES
    });
    setNoMoreTables(false);
  }

  async function handleLoadMore() {
    if (!noMoreTables) {
      setFilters({
        ...filters,
        skip: filters.skip + AMOUNT_OF_TABLES
      });
    }
  }

  return (
    <main className="flex flex-col items-start justify-between p-10">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-row items-center justify-center basis-full gap-x-6"
        >
          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Reservation date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-[240px] pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date >
                          new Date(
                            new Date().setMonth(new Date().getMonth() + 2)
                          ) || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="seats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No of seats</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="No of seats" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Filter</Button>
        </form>
      </Form>
      <div className="w-full flex flex-col items-center justify-start p-10 gap-4">
        {!tables?.length ? (
          <p>
            {filtered
              ? 'No tables available, please use different date or amount of seats'
              : 'Please filter the tables'}
          </p>
        ) : (
          tables.map((table: TableType) => {
            return (
              <div key={table.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{table.seats} Seats Table</CardTitle>
                    <CardDescription>
                      Restaurant {table.restaurant.name} opened from{' '}
                      {table.restaurant.openAt} to
                      {table.restaurant.closeAt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p></p>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full text-wrap flex flex-col items-center gap-2">
                      {table.reservedHours.length ? (
                        <p>
                          Not available at{' '}
                          {table.reservedHours
                            .map((hour) => `${hour}:00`)
                            .join(' - ')}
                        </p>
                      ) : (
                        <></>
                      )}
                      <Button>
                        <Link
                          href={{
                            pathname: `/tables/${table.id}/book`,
                            query: {
                              reservedHours: JSON.stringify(
                                table.reservedHours
                              ),
                              openAt: table.restaurant.openAt,
                              closeAt: table.restaurant.closeAt,
                              date: filters.targetDate
                            }
                          }}
                        >
                          Book
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            );
          })
        )}
        {tables.length ? (
          <Button onClick={handleLoadMore}>Load More ...</Button>
        ) : (
          <></>
        )}
      </div>
    </main>
  );
}

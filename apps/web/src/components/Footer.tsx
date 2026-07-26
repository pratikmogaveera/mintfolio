'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EnvelopeIcon, GithubLogoIcon } from '@phosphor-icons/react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-border mt-auto border-t px-6 py-2 md:px-12">
      <p className="text-muted-foreground mx-auto w-fit text-xs">
        © {new Date().getFullYear()} Mintfolio. Created by{' '}
        <Popover>
          <PopoverTrigger render={<Button variant="link" className="h-fit p-0 text-xs" />}>
            Pratik Mogaveera.
          </PopoverTrigger>
          <PopoverContent className="flex w-64 flex-col gap-0.5">
            <div className="font-semibold">Contact me</div>
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="mt-0.75" />
              <Link title="Email" href="mailto:pratikmogaveera@gmail.com">
                pratikmogaveera@gmail.com
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <GithubLogoIcon className="mt-0.75" />
              <Link title="Github" href="https://github.com/pratikmogaveera">
                pratikmogaveera
              </Link>
            </div>
          </PopoverContent>
        </Popover>
      </p>
    </footer>
  );
}

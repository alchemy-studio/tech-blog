'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Types } from 'mongoose';

interface ArticleVersion {
  content: string;
  editor: {
    _id: string;
    username: string;
  } | null;
  editedAt: Date;
  changeDescription?: string;
}

interface VersionHistoryProps {
  versions: ArticleVersion[];
}

export default function VersionHistory({ versions }: VersionHistoryProps) {
  if (!versions || versions.length === 0) return null;

  return (
    <div className="mt-12">
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
              <span>版本历史 ({versions.length})</span>
              <ChevronUpIcon
                className={`${
                  open ? 'rotate-180 transform' : ''
                } h-5 w-5 text-gray-500`}
              />
            </Disclosure.Button>
            <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-gray-200 pl-4 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          版本 {versions.length - index}
                        </span>
                        <span className="text-gray-500">
                          {format(new Date(version.editedAt), 'yyyy-MM-dd HH:mm')}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        编辑者: {version.editor?.username || '未知编辑者'}
                      </div>
                    </div>
                    {version.changeDescription && (
                      <div className="mt-1 text-gray-600">
                        {version.changeDescription}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </div>
  );
} 
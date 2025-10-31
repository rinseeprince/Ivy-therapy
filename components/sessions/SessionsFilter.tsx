'use client'

import { useState } from 'react'
import { Search, Filter, SortAsc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SessionsFilterProps {
  onSearchChange: (search: string) => void
  onStatusChange: (status: string) => void
  onSortChange: (sort: string) => void
}

export function SessionsFilter({
  onSearchChange,
  onStatusChange,
  onSortChange,
}: SessionsFilterProps) {
  const [search, setSearch] = useState('')

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearchChange(value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cocoa-400" />
        <Input
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 bg-white dark:bg-cocoa-800 border-cocoa-200 focus:border-teal-400"
        />
      </div>

      {/* Status Filter */}
      <Select onValueChange={onStatusChange} defaultValue="all">
        <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-cocoa-800 border-cocoa-200">
          <Filter className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sessions</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select onValueChange={onSortChange} defaultValue="newest">
        <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-cocoa-800 border-cocoa-200">
          <SortAsc className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="longest">Longest First</SelectItem>
          <SelectItem value="shortest">Shortest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

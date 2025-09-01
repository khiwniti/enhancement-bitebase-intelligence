'use client'

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </Card>
  )
}

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  help?: string
  children: React.ReactNode
  className?: string
}

export function FormField({ 
  label, 
  required = false, 
  error, 
  help, 
  children, 
  className = '' 
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-sm text-red-600"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </motion.div>
      )}
      {help && !error && (
        <p className="text-sm text-gray-500">{help}</p>
      )}
    </div>
  )
}

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function PasswordInput({ 
  value, 
  onChange, 
  placeholder = "Enter password",
  required = false,
  className = '' 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className={`relative ${className}`}>
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}

interface FileUploadProps {
  onFileSelect: (files: FileList) => void
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  className?: string
}

export function FileUpload({ 
  onFileSelect, 
  accept, 
  multiple = false, 
  maxSize = 10,
  className = '' 
}: FileUploadProps) {
  const [dragOver, setDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files) {
      onFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-orange-500 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-500">
          Maximum file size: {maxSize}MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && onFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  )
}

interface FormActionsProps {
  onSave?: () => void
  onCancel?: () => void
  onDelete?: () => void
  saveLabel?: string
  cancelLabel?: string
  deleteLabel?: string
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function FormActions({
  onSave,
  onCancel,
  onDelete,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  loading = false,
  disabled = false,
  className = ''
}: FormActionsProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div>
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={loading || disabled}
          >
            {deleteLabel}
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
        )}
        {onSave && (
          <Button
            type="submit"
            onClick={onSave}
            disabled={loading || disabled}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              saveLabel
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

interface ToggleGroupProps {
  options: { value: string; label: string; icon?: React.ComponentType<any> }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ToggleGroup({ options, value, onChange, className = '' }: ToggleGroupProps) {
  return (
    <div className={`flex space-x-1 p-1 bg-gray-100 rounded-lg ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.icon && <option.icon className="h-4 w-4" />}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}

interface CheckboxGroupProps {
  options: { value: string; label: string; description?: string }[]
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function CheckboxGroup({ options, value, onChange, className = '' }: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue])
    } else {
      onChange(value.filter(v => v !== optionValue))
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-start space-x-3">
          <Checkbox
            id={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => handleChange(option.value, checked as boolean)}
          />
          <div className="flex-1">
            <label
              htmlFor={option.value}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
            {option.description && (
              <p className="text-sm text-gray-500 mt-1">{option.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
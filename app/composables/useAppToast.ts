export function useAppToast() {
  const toast = useToast()

  function success(title: string, description?: string) {
    return toast.add({
      title,
      description,
      color: 'success',
      icon: 'i-lucide-circle-check'
    })
  }

  function error(title: string, description?: string) {
    return toast.add({
      title,
      description,
      color: 'error',
      icon: 'i-lucide-circle-x'
    })
  }

  return {
    ...toast,
    success,
    error
  }
}

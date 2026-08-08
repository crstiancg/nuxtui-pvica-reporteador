export function usePermissions() {
  const { user } = useUserSession()

  const permissions = computed(() => user.value?.permissions ?? [])

  const can = (permissionName: string) => permissions.value.includes(permissionName)

  return {
    permissions,
    can
  }
}

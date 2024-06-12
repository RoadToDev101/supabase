import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

import { handleError, post } from 'data/fetchers'
import type { ResponseError } from 'types'

export type OrganizationAcceptInvitationVariables = {
  slug: string
  token: string
}

export async function acceptOrganizationInvitation({
  slug,
  token,
}: OrganizationAcceptInvitationVariables) {
  const { data, error } = await post('/platform/organizations/{slug}/members/invitations/{token}', {
    params: { path: { slug, token } },
  })

  if (error) handleError(error)
  return data
}

type OrganizationMemberUpdateData = Awaited<ReturnType<typeof acceptOrganizationInvitation>>

export const useOrganizationAcceptInvitationMutation = ({
  onSuccess,
  onError,
  ...options
}: Omit<
  UseMutationOptions<
    OrganizationMemberUpdateData,
    ResponseError,
    OrganizationAcceptInvitationVariables
  >,
  'mutationFn'
> = {}) => {
  const queryClient = useQueryClient()

  return useMutation<
    OrganizationMemberUpdateData,
    ResponseError,
    OrganizationAcceptInvitationVariables
  >((vars) => acceptOrganizationInvitation(vars), {
    async onSuccess(data, variables, context) {
      const { slug } = variables

      // if (!skipInvalidation) {
      //   await Promise.all([
      //     queryClient.invalidateQueries(organizationKeys.rolesV2(slug)),
      //     queryClient.invalidateQueries(organizationKeysV1.members(slug)),
      //   ])
      // }

      await onSuccess?.(data, variables, context)
    },
    async onError(data, variables, context) {
      if (onError === undefined) {
        toast.error(`Failed to accept invitation: ${data.message}`)
      } else {
        onError(data, variables, context)
      }
    },
    ...options,
  })
}

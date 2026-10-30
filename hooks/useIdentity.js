
// hooks/useIdentity.js

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMyIdentity,
  saveMyIdentity,
} from "../api/identityApi";

export default function useIdentity() {
  const [identity, setIdentity] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  /**
   * =========================================================
   * LOAD SAVED IDENTITY
   * =========================================================
   */
  const loadIdentity =
    useCallback(async () => {
      try {
        setLoading(true);

        const data =
          await getMyIdentity();

        setIdentity(
          data || null
        );

        return data || null;
      } catch (error) {
        console.error(
          "Load Identity Error:",
          error?.response?.data ||
            error?.message ||
            error
        );

        /*
         * A failure to load identity should
         * NOT destroy the entire UserCard.
         */
        setIdentity(null);

        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * =========================================================
   * SAVE IDENTITY
   * =========================================================
   */
  const saveIdentity =
    useCallback(
      async ({
        bvn = null,
        nin = null,
      } = {}) => {
        try {
          setSaving(true);

          const data =
            await saveMyIdentity({
              bvn,
              nin,
            });

          /*
           * Backend returns the saved
           * masked identity object.
           */
          setIdentity(
            data || null
          );

          return data || null;
        } catch (error) {
          console.error(
            "Save Identity Error:",
            error?.response?.data ||
              error?.message ||
              error
          );

          throw error;
        } finally {
          setSaving(false);
        }
      },
      []
    );

  /**
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */
  useEffect(() => {
    loadIdentity();
  }, [loadIdentity]);

  return {
    identity,
    loading,
    saving,
    saveIdentity,
    loadIdentity,
  };
}

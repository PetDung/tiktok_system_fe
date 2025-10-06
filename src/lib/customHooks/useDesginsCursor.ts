
import { getDesignsCursor, ParamDesign } from "@/service/design/design-service";
import { useFetch } from "../useFetch";
import { DesignCursorPageResponse } from "@/service/types/ApiResponse_v2";

export function useDesignsCursor(param : ParamDesign = {}) {
  return useFetch<DesignCursorPageResponse>({
    fetcher: getDesignsCursor,
    key: "designsCursor",
    param,
  });
}

import { mathPageContent } from "./math-page-content";

// Try to import static data files, fallback to empty objects if they don't exist
let pagesData: any = {};
let supportPagesData: any = {};

try {
  pagesData = require("../data/pages.json");
  // If the file is empty or only contains {}, treat it as empty
  if (!pagesData || Object.keys(pagesData).length === 0) {
    pagesData = {};
  }
} catch (error) {
  console.warn("Static pages data not found, using empty object");
}

try {
  supportPagesData = require("../data/support-pages.json");
  // If the file is empty or only contains {}, treat it as empty
  if (!supportPagesData || Object.keys(supportPagesData).length === 0) {
    supportPagesData = {};
  }
} catch (error) {
  console.warn("Static support pages data not found, using empty object");
}

// Get service content from static data
export const getServiceContent = async (serviceId: string) => {
  try {
    const content = pagesData[serviceId];

    if (content) {
      return {
        success: true,
        data: content,
        message: `${serviceId} content retrieved successfully!`,
      };
    } else {
      // Fallback to default content for math/maths
      if (serviceId === "maths" || serviceId === "math") {
        return {
          success: true,
          data: mathPageContent,
          message: `${serviceId} content retrieved from fallback!`,
        };
      }

      return {
        success: false,
        message: `No content found for ${serviceId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting ${serviceId} content:`, error);

    // Fallback to default content for math/maths
    if (serviceId === "maths" || serviceId === "math") {
      return {
        success: true,
        data: mathPageContent,
        message: `${serviceId} content retrieved from fallback!`,
      };
    }

    return {
      success: false,
      message: `Failed to retrieve ${serviceId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all support pages from static data
export const getAllSupportPages = async () => {
  try {
    return {
      success: true,
      data: supportPagesData,
      message: "All support pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all support pages:", error);
    return {
      success: false,
      message: `Failed to retrieve support pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get support page content from static data
export const getSupportPageContent = async (
  serviceId: string,
  pageId: string
) => {
  try {
    const pageData = supportPagesData[serviceId]?.[pageId];

    if (pageData) {
      return {
        success: true,
        data: pageData,
        message: `${serviceId}/${pageId} content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No content found for ${serviceId}/${pageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting ${serviceId}/${pageId} content:`, error);
    return {
      success: false,
      message: `Failed to retrieve ${serviceId}/${pageId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all pages from static data
export const getAllPages = async () => {
  try {
    return {
      success: true,
      data: pagesData,
      message: "All pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all pages:", error);
    return {
      success: false,
      message: `Failed to retrieve pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { mathPageContent } from "./math-page-content";

// Upload math page content to Firestore
export const uploadMathPageContent = async () => {
  try {
    const docRef = doc(db, "pages", "math");
    await setDoc(docRef, {
      ...mathPageContent,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: "Math page content uploaded successfully to Firestore!",
    };
  } catch (error) {
    console.error("Error uploading math page content:", error);
    return {
      success: false,
      message: `Failed to upload content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get math page content from Firestore
export const getMathPageContent = async () => {
  try {
    const docRef = doc(db, "pages", "math");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: "Math page content retrieved successfully!",
      };
    } else {
      return {
        success: false,
        message: "No math page content found in Firestore",
      };
    }
  } catch (error) {
    console.error("Error getting math page content:", error);
    return {
      success: false,
      message: `Failed to retrieve content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload custom content to Firestore
export const uploadCustomMathContent = async (content: any) => {
  try {
    const docRef = doc(db, "pages", "math");
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: "Custom math page content uploaded successfully to Firestore!",
    };
  } catch (error) {
    console.error("Error uploading custom math page content:", error);
    return {
      success: false,
      message: `Failed to upload custom content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all pages from Firestore
export const getAllPages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "pages"));
    const pages: any = {};

    querySnapshot.forEach((doc) => {
      pages[doc.id] = doc.data();
    });

    return {
      success: true,
      data: pages,
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

// Get service content from Firestore by service ID
export const getServiceContent = async (serviceId: string) => {
  try {
    const docRef = doc(db, "pages", serviceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `${serviceId} content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No content found for ${serviceId} in Firestore`,
      };
    }
  } catch (error) {
    console.error(`Error getting ${serviceId} content:`, error);
    return {
      success: false,
      message: `Failed to retrieve ${serviceId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload service content to Firestore by service ID
export const uploadServiceContent = async (serviceId: string, content: any) => {
  try {
    const docRef = doc(db, "pages", serviceId);
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: `${serviceId} content uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(`Error uploading ${serviceId} content:`, error);
    return {
      success: false,
      message: `Failed to upload ${serviceId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete service content from Firestore by service ID
export const deleteServiceContent = async (serviceId: string) => {
  try {
    const docRef = doc(db, "pages", serviceId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `${serviceId} content deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(`Error deleting ${serviceId} content:`, error);
    return {
      success: false,
      message: `Failed to delete ${serviceId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all services from Firestore
export const getAllServices = async () => {
  try {
    console.log("Fetching services from Firestore...");
    const querySnapshot = await getDocs(collection(db, "pages"));
    console.log("Services query snapshot size:", querySnapshot.size);

    const services: string[] = [];

    querySnapshot.forEach((doc) => {
      console.log("Service Document ID:", doc.id, "Data:", doc.data());
      services.push(doc.id);
    });

    console.log("Available services:", services);
    return {
      success: true,
      data: services,
      message: "All services retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all services:", error);
    return {
      success: false,
      message: `Failed to retrieve services: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all support pages from Firestore
export const getAllSupportPages = async () => {
  try {
    console.log("Fetching support pages from Firestore...");
    const querySnapshot = await getDocs(collection(db, "supportPages"));
    console.log("Query snapshot size:", querySnapshot.size);

    const pages: any = {};

    querySnapshot.forEach((doc) => {
      console.log("Document ID:", doc.id, "Data:", doc.data());
      const docData = doc.data();
      const serviceId = docData.serviceId || doc.id.split("_")[0];
      const pageId = docData.pageId || doc.id.split("_")[1];

      if (!pages[serviceId]) {
        pages[serviceId] = {};
      }

      pages[serviceId][pageId] = docData;
    });

    console.log("Processed pages structure:", pages);
    return {
      success: true,
      data: pages,
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

// Get support page content from Firestore by service and page ID
export const getSupportPageContent = async (
  serviceId: string,
  pageId: string
) => {
  try {
    const docRef = doc(db, "supportPages", `${serviceId}_${pageId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `${serviceId}/${pageId} content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No content found for ${serviceId}/${pageId} in Firestore`,
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

// Upload support page content to Firestore by service and page ID
export const uploadSupportPageContent = async (
  serviceId: string,
  pageId: string,
  content: any
) => {
  try {
    const docRef = doc(db, "supportPages", `${serviceId}_${pageId}`);
    await setDoc(docRef, {
      ...content,
      serviceId,
      pageId,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: `${serviceId}/${pageId} content uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(`Error uploading ${serviceId}/${pageId} content:`, error);
    return {
      success: false,
      message: `Failed to upload ${serviceId}/${pageId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete support page content from Firestore by service and page ID
export const deleteSupportPageContent = async (
  serviceId: string,
  pageId: string
) => {
  try {
    const docRef = doc(db, "supportPages", `${serviceId}_${pageId}`);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `${serviceId}/${pageId} content deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(`Error deleting ${serviceId}/${pageId} content:`, error);
    return {
      success: false,
      message: `Failed to delete ${serviceId}/${pageId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Test function to verify Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log("Testing Firebase connection...");
    const querySnapshot = await getDocs(collection(db, "pages"));
    console.log(
      "Successfully connected to Firebase. Pages collection size:",
      querySnapshot.size
    );
    return {
      success: true,
      message: "Firebase connection successful",
      pagesCount: querySnapshot.size,
    };
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return {
      success: false,
      message: `Firebase connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

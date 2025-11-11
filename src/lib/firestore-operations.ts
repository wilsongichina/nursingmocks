import { db, storage } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
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

// Helper function to encode serviceId for use in Firestore document IDs
// Replaces slashes with double dashes to avoid path issues
const encodeServiceId = (serviceId: string): string => {
  return serviceId.replace(/\//g, "--");
};

// Get support page content from Firestore by service and page ID
export const getSupportPageContent = async (
  serviceId: string,
  pageId: string
) => {
  try {
    const encodedServiceId = encodeServiceId(serviceId);
    const docRef = doc(db, "supportPages", `${encodedServiceId}_${pageId}`);
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
    const encodedServiceId = encodeServiceId(serviceId);
    const docRef = doc(db, "supportPages", `${encodedServiceId}_${pageId}`);
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
    const encodedServiceId = encodeServiceId(serviceId);
    const docRef = doc(db, "supportPages", `${encodedServiceId}_${pageId}`);
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

// Blog Operations
export const getAllBlogs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "blogs"));
    const blogs: any[] = [];

    querySnapshot.forEach((doc) => {
      blogs.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Sort by date (newest first)
    blogs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      success: true,
      data: blogs,
      message: "All blogs retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all blogs:", error);
    return {
      success: false,
      message: `Failed to retrieve blogs: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const getBlogContent = async (blogId: string) => {
  try {
    const docRef = doc(db, "blogs", blogId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Blog content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No blog found with ID: ${blogId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting blog content:`, error);
    return {
      success: false,
      message: `Failed to retrieve blog content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const uploadBlogContent = async (blogId: string, content: any) => {
  try {
    const docRef = doc(db, "blogs", blogId);
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    });

    return {
      success: true,
      message: `Blog content uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(`Error uploading blog content:`, error);
    return {
      success: false,
      message: `Failed to upload blog content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const deleteBlogContent = async (blogId: string) => {
  try {
    const docRef = doc(db, "blogs", blogId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Blog deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(`Error deleting blog:`, error);
    return {
      success: false,
      message: `Failed to delete blog: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all blog categories
export const getAllBlogCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "blogCategories"));
    const categories: any[] = [];

    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: categories,
      message: "All blog categories retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting blog categories:", error);
    return {
      success: false,
      message: `Failed to retrieve blog categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Add a new blog category
export const addBlogCategory = async (categoryName: string) => {
  try {
    const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(db, "blogCategories", categoryId);
    await setDoc(docRef, {
      name: categoryName,
      slug: categoryId,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Category "${categoryName}" added successfully!`,
    };
  } catch (error) {
    console.error(`Error adding blog category:`, error);
    return {
      success: false,
      message: `Failed to add blog category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get blogs by category
export const getBlogsByCategory = async (category: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, "blogs"));
    const blogs: any[] = [];

    querySnapshot.forEach((doc) => {
      const blogData = doc.data();
      if (blogData.category === category) {
        blogs.push({
          id: doc.id,
          ...blogData,
        });
      }
    });

    // Sort by date (newest first)
    blogs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      success: true,
      data: blogs,
      message: `Blogs in category "${category}" retrieved successfully!`,
    };
  } catch (error) {
    console.error("Error getting blogs by category:", error);
    return {
      success: false,
      message: `Failed to retrieve blogs by category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== ROUTE RESOLVER ====================

// Check if a slug is a pillar page (not TEAS which is homepage)
export const isPillarPage = async (slug: string): Promise<boolean> => {
  try {
    // Special case: "teas" is the homepage, not a pillar page route
    if (slug === "teas" || slug === "" || !slug) {
      return false;
    }
    
    const result = await getPillarPageContent(slug);
    return result.success && result.data !== null;
  } catch {
    return false;
  }
};

// Check if a slug is a TEAS support page (in pages collection)
export const isTeasSupportPage = async (slug: string): Promise<boolean> => {
  try {
    // Check if it exists in pages collection (TEAS support pages)
    const result = await getServiceContent(slug);
    return result.success && result.data !== null;
  } catch {
    return false;
  }
};

// ==================== PILLAR PAGES OPERATIONS ====================

// Get all pillar pages from Firestore
export const getAllPillarPages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "pillarPages"));
    const pillarPages: any[] = [];

    querySnapshot.forEach((doc) => {
      pillarPages.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: pillarPages,
      message: "All pillar pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all pillar pages:", error);
    return {
      success: false,
      message: `Failed to retrieve pillar pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get pillar page content from Firestore by pillar page ID
export const getPillarPageContent = async (pillarPageId: string) => {
  try {
    const docRef = doc(db, "pillarPages", pillarPageId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Pillar page ${pillarPageId} content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No pillar page content found for ${pillarPageId} in Firestore`,
      };
    }
  } catch (error) {
    console.error(`Error getting pillar page ${pillarPageId} content:`, error);
    return {
      success: false,
      message: `Failed to retrieve pillar page ${pillarPageId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload pillar page content to Firestore by pillar page ID
export const uploadPillarPageContent = async (
  pillarPageId: string,
  content: any
) => {
  try {
    const docRef = doc(db, "pillarPages", pillarPageId);
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Pillar page ${pillarPageId} content uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(`Error uploading pillar page ${pillarPageId} content:`, error);
    return {
      success: false,
      message: `Failed to upload pillar page ${pillarPageId} content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete pillar page content from Firestore by pillar page ID
export const deletePillarPageContent = async (pillarPageId: string) => {
  try {
    const docRef = doc(db, "pillarPages", pillarPageId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Pillar page ${pillarPageId} deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(`Error deleting pillar page ${pillarPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete pillar page ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get service page content under a pillar page
export const getPillarServicePageContent = async (
  pillarPageId: string,
  servicePageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      pillarPageId,
      "services",
      servicePageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Service page ${servicePageId} under ${pillarPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No service page content found for ${pillarPageId}/${servicePageId} in Firestore`,
      };
    }
  } catch (error) {
    console.error(
      `Error getting service page ${servicePageId} under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve service page ${servicePageId} under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload service page content under a pillar page
export const uploadPillarServicePageContent = async (
  pillarPageId: string,
  servicePageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      pillarPageId,
      "services",
      servicePageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Service page ${servicePageId} under ${pillarPageId} uploaded successfully to Firestore!`,
    };
  } catch (error) {
    console.error(
      `Error uploading service page ${servicePageId} under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to upload service page ${servicePageId} under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete service page content under a pillar page
export const deletePillarServicePageContent = async (
  pillarPageId: string,
  servicePageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      pillarPageId,
      "services",
      servicePageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Service page ${servicePageId} under ${pillarPageId} deleted successfully from Firestore!`,
    };
  } catch (error) {
    console.error(
      `Error deleting service page ${servicePageId} under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to delete service page ${servicePageId} under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all service pages under a pillar page
export const getAllPillarServicePages = async (pillarPageId: string) => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", pillarPageId, "services")
    );
    const servicePages: any[] = [];

    querySnapshot.forEach((doc) => {
      servicePages.push({
        id: doc.id,
        servicePageId: doc.id,
        pillarPageId: pillarPageId,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: servicePages,
      message: `All service pages under ${pillarPageId} retrieved successfully!`,
    };
  } catch (error) {
    console.error(
      `Error getting all service pages under ${pillarPageId}:`,
      error
    );
    return {
      success: false,
      message: `Failed to retrieve service pages under ${pillarPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Image Upload Functions
export const uploadImage = async (
  file: File,
  folder: string = "blog-images"
) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${folder}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      data: {
        url: downloadURL,
        path: fileName,
      },
      message: "Image uploaded successfully!",
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      message: `Failed to upload image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

export const deleteImage = async (imagePath: string) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);

    return {
      success: true,
      message: "Image deleted successfully!",
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      message: `Failed to delete image: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// =====================
// Question Operations
// =====================

// Upload or update a question
export const uploadQuestionContent = async (
  serviceId: string,
  slug: string,
  content: any
) => {
  try {
    const docRef = doc(db, "questions", `${serviceId}_${slug}`);
    await setDoc(docRef, {
      ...content,
      serviceId,
      slug,
      lastUpdated: new Date().toISOString(),
      createdAt: content.createdAt || new Date().toISOString(),
      version: "1.0",
    });
    return {
      success: true,
      message: "Question uploaded successfully!",
    };
  } catch (error) {
    console.error("Error uploading question content:", error);
    return {
      success: false,
      message: `Failed to upload question: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a single question by serviceId and slug
export const getQuestionContent = async (serviceId: string, slug: string) => {
  try {
    const docRef = doc(db, "questions", `${serviceId}_${slug}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question found for ${serviceId}/${slug}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question content:`, error);
    return {
      success: false,
      message: `Failed to retrieve question content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get question content by category and slug
export const getQuestionContentByCategory = async (
  category: string,
  slug: string
): Promise<{
  success: boolean;
  data?: any;
  message: string;
}> => {
  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    let questionData = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category === category && data.slug === slug) {
        questionData = data;
      }
    });

    if (questionData) {
      return {
        success: true,
        data: questionData,
        message: `Question content retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question found for ${category}/${slug}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question content by category:`, error);
    return {
      success: false,
      message: `Failed to retrieve question content: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all questions, optionally filtered by serviceId
export const getAllQuestions = async (serviceId?: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, "questions"));
    const questions: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!serviceId || data.serviceId === serviceId) {
        questions.push({ id: doc.id, ...data });
      }
    });
    // Optionally sort by createdAt or lastUpdated
    questions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return {
      success: true,
      data: questions,
      message: "All questions retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting all questions:", error);
    return {
      success: false,
      message: `Failed to retrieve questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete a question
export const deleteQuestionContent = async (
  serviceId: string,
  slug: string
) => {
  try {
    const docRef = doc(db, "questions", `${serviceId}_${slug}`);
    await deleteDoc(docRef);
    return {
      success: true,
      message: `Question deleted successfully!`,
    };
  } catch (error) {
    console.error("Error deleting question:", error);
    return {
      success: false,
      message: `Failed to delete question: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all question categories
export const getAllQuestionCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "questionCategories"));
    const categories: any[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return {
      success: true,
      data: categories,
      message: "All question categories retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting question categories:", error);
    return {
      success: false,
      message: `Failed to retrieve question categories: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Add a new question category
export const addQuestionCategory = async (categoryName: string) => {
  try {
    const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(db, "questionCategories", categoryId);
    await setDoc(docRef, {
      name: categoryName,
      slug: categoryId,
      createdAt: new Date().toISOString(),
    });
    return {
      success: true,
      message: `Category "${categoryName}" added successfully!`,
    };
  } catch (error) {
    console.error(`Error adding question category:`, error);
    return {
      success: false,
      message: `Failed to add question category: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all services (HESI, TEAS, etc.)
export const getAllServicesList = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "services"));
    const services: any[] = [];
    querySnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() });
    });
    return {
      success: true,
      data: services,
      message: "All services retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting services:", error);
    return {
      success: false,
      message: `Failed to retrieve services: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Add a new service
export const addService = async (serviceName: string) => {
  try {
    const serviceId = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const docRef = doc(db, "services", serviceId);
    await setDoc(docRef, {
      name: serviceName,
      slug: serviceId,
      createdAt: new Date().toISOString(),
    });
    return {
      success: true,
      message: `Service "${serviceName}" added successfully!`,
    };
  } catch (error) {
    console.error(`Error adding service:`, error);
    return {
      success: false,
      message: `Failed to add service: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get service by ID
export const getServiceById = async (serviceId: string) => {
  try {
    const docRef = doc(db, "services", serviceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        success: true,
        data: { id: docSnap.id, ...docSnap.data() },
        message: "Service retrieved successfully!",
      };
    } else {
      return {
        success: false,
        message: `No service found with ID: ${serviceId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting service:`, error);
    return {
      success: false,
      message: `Failed to retrieve service: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Initialize default services (HESI and TEAS)
export const initializeDefaultServices = async () => {
  try {
    const defaultServices = [
      { name: "HESI", slug: "hesi" },
      { name: "TEAS", slug: "teas" },
    ];

    for (const service of defaultServices) {
      const docRef = doc(db, "services", service.slug);
      await setDoc(docRef, {
        name: service.name,
        slug: service.slug,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      message: "Default services (HESI and TEAS) initialized successfully!",
    };
  } catch (error) {
    console.error("Error initializing default services:", error);
    return {
      success: false,
      message: `Failed to initialize default services: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

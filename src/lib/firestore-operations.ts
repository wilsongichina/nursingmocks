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
    console.error(
      `Error uploading pillar page ${pillarPageId} content:`,
      error
    );
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

// Initialize dummy content for Nursing Exit Exam
export const initializeNursingExitExamContent = async () => {
  try {
    const dummyContent = {
      meta: {
        title: "Nursing Exit Exam | TeasGurus",
        description:
          "Comprehensive guide to nursing exit exams. Prepare for your nursing exit exam with expert resources, practice questions, and study guides.",
        keywords:
          "nursing exit exam, nursing school exit exam, NCLEX preparation, nursing graduation exam, exit exam study guide",
        ogTitle: "Nursing Exit Exam | TeasGurus",
        ogDescription:
          "Comprehensive guide to nursing exit exams. Prepare for your nursing exit exam with expert resources, practice questions, and study guides.",
        ogImage: "/teas-gurus-logo.png",
        canonicalUrl: "https://teasgurus.com/nursing-exit-exam",
      },
      schema: "",
      hero: {
        badge: "We are Teas Gurus",
        title: "Nursing Exit Exam",
        subtitle: "Your comprehensive guide to success",
        description:
          "<p>Prepare for your nursing exit exam with confidence. Our comprehensive resources, practice questions, and expert guidance will help you succeed in your final nursing school assessment.</p>",
      },
      trustIndicators: [
        {
          title: "Expert Guidance",
          icon: "star",
        },
        {
          title: "Comprehensive Resources",
          icon: "book",
        },
        {
          title: "Proven Success",
          icon: "trophy",
        },
        {
          title: "24/7 Support",
          icon: "clock",
        },
      ],
      whatToExpect: {
        badge: "What to Expect",
        title: "Understanding the Nursing Exit Exam",
        subtitle:
          "<p>Learn what to expect on your nursing exit exam and how to prepare effectively.</p>",
        cards: [
          {
            title: "Exam Format",
            icon: "book",
            content: [
              "<p>Multiple-choice questions covering all nursing fundamentals</p>",
              "<p>Clinical scenario-based questions</p>",
              "<p>Time-limited assessment</p>",
            ],
          },
          {
            title: "Preparation Tips",
            icon: "lightbulb",
            content: [
              "<p>Review all core nursing concepts</p>",
              "<p>Practice with sample questions</p>",
              "<p>Create a study schedule</p>",
            ],
          },
        ],
        footer:
          "<p>With proper preparation and the right resources, you can excel on your nursing exit exam.</p>",
      },
      mostCommonQuestions: {
        badge: "Common Questions",
        title: "Most Common Questions About Nursing Exit Exams",
        subtitle:
          "Find answers to frequently asked questions about nursing exit exams.",
        cards: [
          {
            title: "What is a nursing exit exam?",
            content: [
              "<p>A nursing exit exam is a comprehensive assessment taken by nursing students before graduation to evaluate their readiness for the NCLEX and professional practice.</p>",
            ],
          },
          {
            title: "How should I prepare?",
            content: [
              "<p>Start early, review all core concepts, practice with sample questions, and utilize study guides and resources.</p>",
            ],
          },
        ],
      },
      studyGuide: {
        badge: "Study Guide",
        title: "Comprehensive Study Guide",
        subtitle:
          "<p>Access our comprehensive study materials to help you prepare for your nursing exit exam.</p>",
        sections: [
          {
            title: "Fundamentals",
            icon: "book",
            content:
              "<p>Review essential nursing fundamentals and core concepts.</p>",
          },
          {
            title: "Practice Questions",
            icon: "lightbulb",
            content:
              "<p>Access thousands of practice questions with detailed explanations.</p>",
          },
          {
            title: "Study Plans",
            icon: "clock",
            content:
              "<p>Follow structured study plans designed for success.</p>",
          },
          {
            title: "Expert Tips",
            icon: "star",
            content:
              "<p>Learn from nursing experts and successful graduates.</p>",
          },
        ],
      },
      privacyPricing: [
        {
          title: "Privacy & Security",
          icon: "shield",
          content:
            "<p>Your data is secure and private. We never share your information with third parties.</p>",
        },
        {
          title: "Affordable Pricing",
          icon: "star",
          content:
            "<p>Access comprehensive resources at affordable prices. Multiple pricing plans available.</p>",
        },
      ],
      faq: {
        title: "Frequently Asked Questions",
        subtitle:
          "<p>Find answers to common questions about nursing exit exams and our preparation resources.</p>",
        questions: [
          {
            question: "What topics are covered on the nursing exit exam?",
            paragraphs: [
              "<p>The nursing exit exam typically covers all core nursing concepts including fundamentals, medical-surgical nursing, pharmacology, pathophysiology, and nursing care across the lifespan.</p>",
            ],
          },
          {
            question: "How long does it take to prepare for the exit exam?",
            paragraphs: [
              "<p>Preparation time varies, but most students benefit from 4-8 weeks of focused study. Start early and create a consistent study schedule.</p>",
            ],
          },
          {
            question: "Are practice questions available?",
            paragraphs: [
              "<p>Yes, we provide thousands of practice questions with detailed explanations to help you prepare effectively.</p>",
            ],
          },
        ],
      },
      lastUpdated: new Date().toISOString(),
      version: "1.0",
    };

    const docRef = doc(db, "pillarPages", "nursing-exit-exam");
    await setDoc(docRef, dummyContent);

    return {
      success: true,
      message: "Nursing Exit Exam dummy content initialized successfully!",
    };
  } catch (error) {
    console.error("Error initializing Nursing Exit Exam content:", error);
    return {
      success: false,
      message: `Failed to initialize content: ${
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

// ==================== NURSING ENTRANCE EXAM SUB-PAGES OPERATIONS ====================

// Get all sub-pages under nursing-entrance-exam
export const getNursingEntranceExamSubPages = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-entrance-exam", "subPages")
    );
    const subPages: any[] = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
      message: "All sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific sub-page content
export const getNursingEntranceExamSubPage = async (subPageId: string) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      subPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Sub-page ${subPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No sub-page content found for ${subPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update sub-page content
export const uploadNursingEntranceExamSubPage = async (
  subPageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      subPageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Sub-page ${subPageId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete sub-page
export const deleteNursingEntranceExamSubPage = async (subPageId: string) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      subPageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Sub-page ${subPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING EXIT EXAM SUB-PAGES OPERATIONS ====================

// Get all sub-pages under nursing-exit-exam
export const getNursingExitExamSubPages = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-exit-exam", "subPages")
    );
    const subPages: any[] = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
      message: "All sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific sub-page content
export const getNursingExitExamSubPage = async (subPageId: string) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-exit-exam",
      "subPages",
      subPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Sub-page ${subPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No sub-page content found for ${subPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update sub-page content
export const uploadNursingExitExamSubPage = async (
  subPageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-exit-exam",
      "subPages",
      subPageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Sub-page ${subPageId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete sub-page
export const deleteNursingExitExamSubPage = async (subPageId: string) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-exit-exam",
      "subPages",
      subPageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Sub-page ${subPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NESTED SUB-PAGES OPERATIONS ====================

// Get all nested sub-pages under a specific sub-page (for entrance exam)
export const getNestedSubPages = async (parentSubPageId: string) => {
  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-entrance-exam",
        "subPages",
        parentSubPageId,
        "nestedSubPages"
      )
    );
    const nestedSubPages: any[] = [];

    querySnapshot.forEach((doc) => {
      nestedSubPages.push({
        id: doc.id,
        nestedSubPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: nestedSubPages,
      message: "All nested sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting nested sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all nested sub-pages under a specific sub-page (for exit exam)
export const getNursingExitExamNestedSubPages = async (
  parentSubPageId: string
) => {
  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-exit-exam",
        "subPages",
        parentSubPageId,
        "nestedSubPages"
      )
    );
    const nestedSubPages: any[] = [];

    querySnapshot.forEach((doc) => {
      nestedSubPages.push({
        id: doc.id,
        nestedSubPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: nestedSubPages,
      message: "All nested sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting nested sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific nested sub-page content (for exit exam)
export const getNursingExitExamNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-exit-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No nested sub-page content found for ${nestedSubPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update nested sub-page content (for exit exam)
export const uploadNursingExitExamNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-exit-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete nested sub-page (for exit exam)
export const deleteNursingExitExamNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-exit-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING TEST BANK SUB-PAGES OPERATIONS ====================

// Get all sub-pages under nursing-test-bank
export const getNursingTestBankSubPages = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "pillarPages", "nursing-test-bank", "subPages")
    );
    const subPages: any[] = [];

    querySnapshot.forEach((doc) => {
      subPages.push({
        id: doc.id,
        subPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: subPages,
      message: "All sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific sub-page content
export const getNursingTestBankSubPage = async (subPageId: string) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      subPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Sub-page ${subPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No sub-page content found for ${subPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update sub-page content
export const uploadNursingTestBankSubPage = async (
  subPageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      subPageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Sub-page ${subPageId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete sub-page
export const deleteNursingTestBankSubPage = async (subPageId: string) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      subPageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Sub-page ${subPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting sub-page ${subPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete sub-page ${subPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get all nested sub-pages under a specific sub-page (for test bank)
export const getNursingTestBankNestedSubPages = async (
  parentSubPageId: string
) => {
  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-test-bank",
        "subPages",
        parentSubPageId,
        "nestedSubPages"
      )
    );
    const nestedSubPages: any[] = [];

    querySnapshot.forEach((doc) => {
      nestedSubPages.push({
        id: doc.id,
        nestedSubPageId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: nestedSubPages,
      message: "All nested sub-pages retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting nested sub-pages:", error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific nested sub-page content (for test bank)
export const getNursingTestBankNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No nested sub-page content found for ${nestedSubPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update nested sub-page content (for test bank)
export const uploadNursingTestBankNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete nested sub-page (for test bank)
export const deleteNursingTestBankNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING TEST BANK TOPICS OPERATIONS ====================

// Get all topics under a specific nested sub-page (for test bank)
export const getNursingTestBankTopics = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-test-bank",
        "subPages",
        parentSubPageId,
        "nestedSubPages",
        nestedSubPageId,
        "topics"
      )
    );
    const topics: any[] = [];

    querySnapshot.forEach((doc) => {
      topics.push({
        id: doc.id,
        topicId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: topics,
      message: "All topics retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting topics:", error);
    return {
      success: false,
      message: `Failed to retrieve topics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific topic content (for test bank)
export const getNursingTestBankTopic = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "topics",
      topicId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Topic ${topicId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No topic content found for ${topicId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting topic ${topicId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve topic ${topicId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update topic content (for test bank)
export const uploadNursingTestBankTopic = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "topics",
      topicId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Topic ${topicId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading topic ${topicId}:`, error);
    return {
      success: false,
      message: `Failed to upload topic ${topicId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete topic (for test bank)
export const deleteNursingTestBankTopic = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  topicId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-test-bank",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "topics",
      topicId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Topic ${topicId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting topic ${topicId}:`, error);
    return {
      success: false,
      message: `Failed to delete topic ${topicId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific nested sub-page content
export const getNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Nested sub-page ${nestedSubPageId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No nested sub-page content found for ${nestedSubPageId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update nested sub-page content
export const uploadNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to upload nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete nested sub-page
export const deleteNestedSubPage = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Nested sub-page ${nestedSubPageId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting nested sub-page ${nestedSubPageId}:`, error);
    return {
      success: false,
      message: `Failed to delete nested sub-page ${nestedSubPageId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING ENTRANCE EXAM QUIZZES OPERATIONS ====================

// Get all quizzes under a nested sub-page (for entrance exam)
export const getNursingEntranceExamQuizzes = async (
  parentSubPageId: string,
  nestedSubPageId: string
) => {
  try {
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-entrance-exam",
        "subPages",
        parentSubPageId,
        "nestedSubPages",
        nestedSubPageId,
        "quizzes"
      )
    );
    const quizzes: any[] = [];

    querySnapshot.forEach((doc) => {
      quizzes.push({
        id: doc.id,
        quizId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: quizzes,
      message: "All quizzes retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quizzes:", error);
    return {
      success: false,
      message: `Failed to retrieve quizzes: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific quiz content (for entrance exam)
export const getNursingEntranceExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    // Get all quizzes to search by slug
    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-entrance-exam",
        "subPages",
        parentSubPageId,
        "nestedSubPages",
        nestedSubPageId,
        "quizzes"
      )
    );

    // First, try to find by slug (this is the primary method for frontend access)
    for (const doc of querySnapshot.docs) {
      const quizData = doc.data();
      const quizSlug = quizData.slug || "";

      // Check if the slug matches (case-insensitive)
      if (quizSlug.toLowerCase() === quizId.toLowerCase()) {
        return {
          success: true,
          data: {
            id: doc.id,
            quizId: doc.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully by slug!`,
        };
      }
    }

    // If not found by slug, try by document ID (for admin panel backward compatibility)
    // But only if the document ID matches AND there's no slug set (for old quizzes without slugs)
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      quizId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const quizData = docSnap.data();
      const quizSlug = quizData.slug || "";

      // Only allow document ID access if:
      // 1. There's no slug set (old quiz without slug), OR
      // 2. The document ID matches the slug (backward compatibility for quizzes where ID = slug)
      if (!quizSlug || quizSlug.toLowerCase() === quizId.toLowerCase()) {
        return {
          success: true,
          data: {
            id: docSnap.id,
            quizId: docSnap.id,
            ...quizData,
          },
          message: `Quiz ${quizId} retrieved successfully!`,
        };
      }
      // If slug exists and doesn't match, don't return (slug URL must be used)
    }

    // If still not found, return error
    return {
      success: false,
      message: `No quiz content found for ${quizId}`,
    };
  } catch (error) {
    console.error(`Error getting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update quiz content (for entrance exam)
export const uploadNursingEntranceExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  content: any
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      quizId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Quiz ${quizId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to upload quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete quiz (for entrance exam)
export const deleteNursingEntranceExamQuiz = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      quizId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Quiz ${quizId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    return {
      success: false,
      message: `Failed to delete quiz ${quizId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// ==================== NURSING ENTRANCE EXAM QUIZ QUESTIONS OPERATIONS ====================

// Get all questions under a quiz (for entrance exam)
export const getNursingEntranceExamQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string
) => {
  try {
    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    // The getNursingEntranceExamQuiz function now returns the document ID in the data
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const querySnapshot = await getDocs(
      collection(
        db,
        "pillarPages",
        "nursing-entrance-exam",
        "subPages",
        parentSubPageId,
        "nestedSubPages",
        nestedSubPageId,
        "quizzes",
        actualQuizId,
        "questions"
      )
    );
    const questions: any[] = [];

    querySnapshot.forEach((doc) => {
      questions.push({
        id: doc.id,
        questionId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: questions,
      message: "All questions retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting quiz questions:", error);
    return {
      success: false,
      message: `Failed to retrieve questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific question content (for entrance exam quiz)
export const getNursingEntranceExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string
) => {
  try {
    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question ${questionId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question content found for ${questionId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update question content (for entrance exam quiz)
export const uploadNursingEntranceExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string,
  content: any
) => {
  try {
    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await setDoc(docRef, {
      ...content,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Question ${questionId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to upload question ${questionId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Bulk upload questions (for entrance exam quiz)
export const bulkUploadNursingEntranceExamQuizQuestions = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questions: any[]
) => {
  try {
    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const results = [];
    const errors = [];

    for (const question of questions) {
      try {
        // Parse options - always treat as string and parse JSON
        let optionsArray: string[] = [];

        if (question.options) {
          try {
            // Convert to string if not already
            const optionsString =
              typeof question.options === "string"
                ? question.options
                : JSON.stringify(question.options);

            // Parse the JSON string
            const optionsObject = JSON.parse(optionsString);

            // Convert options object to array format
            optionsArray = Object.keys(optionsObject)
              .sort()
              .map((key) => {
                const option = optionsObject[key];
                let optionText = "";

                // Extract choice text, handling both object with choice property and direct string
                if (
                  typeof option === "object" &&
                  option !== null &&
                  option.choice
                ) {
                  optionText = String(option.choice).trim();
                } else if (typeof option === "string") {
                  optionText = option.trim();
                } else {
                  optionText = String(option || "").trim();
                }

                // Remove quotes from start and end if present (handle multiple quote types)
                // Keep removing quotes until no more quotes at start/end
                let cleaned = optionText;
                let changed = true;
                const quoteChars = [
                  '"',
                  "'",
                  "\u201C",
                  "\u201D",
                  "\u2018",
                  "\u2019",
                ]; // straight and curly quotes

                while (changed && cleaned.length >= 2) {
                  changed = false;
                  for (const quote of quoteChars) {
                    if (cleaned.startsWith(quote) && cleaned.endsWith(quote)) {
                      cleaned = cleaned.slice(1, -1).trim();
                      changed = true;
                      break; // Start over to check for nested quotes
                    }
                  }
                }

                return cleaned;
              });
          } catch (e) {
            console.error("Error parsing options:", e);
          }
        }

        // Helper function to strip HTML tags and generate slug
        const stripHtmlTags = (html: string): string => {
          if (!html) return "";
          return html.replace(/<[^>]*>/g, "").trim();
        };

        const generateSlug = (questionText: string): string => {
          if (!questionText) return "";
          const cleanText = stripHtmlTags(questionText);
          const truncated = cleanText.substring(0, 180);
          const slug = truncated
            .toLowerCase()
            .replace(/nbsp/g, "")
            .replace(/&nbsp;/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          return slug;
        };

        // Handle correctAnswer based on question type
        const questionTypeId = question.question_type_id || 1;
        let correctAnswerToSave: any =
          question.correctAnswer || question.correct_answer || "";

        // For type 7 (numeric), ensure correctAnswer is an array, not a JSON string
        if (questionTypeId === 7) {
          if (typeof correctAnswerToSave === "string") {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(correctAnswerToSave);
              correctAnswerToSave = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              // If not JSON, wrap in array
              correctAnswerToSave = [correctAnswerToSave];
            }
          } else if (!Array.isArray(correctAnswerToSave)) {
            // If it's not an array, wrap it
            correctAnswerToSave = [String(correctAnswerToSave)];
          }
        }

        // Create question content
        const questionContent = {
          question: question.question || "",
          options: optionsArray,
          correctAnswer: correctAnswerToSave,
          explanation: question.solution || question.explanation || "",
          questionTypeId: questionTypeId,
          slug: generateSlug(question.question || ""),
          originalId: question.id?.toString() || "",
          questionId:
            question.id?.toString() || question.questionId?.toString() || "",
          // Meta fields (editable after upload)
          meta: {
            title: "",
            description: "",
            keywords: "",
            ogTitle: "",
            ogDescription: "",
            ogImage: "",
            canonicalUrl: "",
          },
          schema: "",
          status: "published",
          // Additional fields from original data
          tabs: question.tabs || null,
          matchOption: question.match_option || null,
          imagePath: question.image_path || null,
          units: question.units || null,
          subquestions: question.subquestions || [],
        };

        // Use question ID as the document ID, or generate one
        const questionDocId =
          question.id?.toString() ||
          `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const docRef = doc(
          db,
          "pillarPages",
          "nursing-entrance-exam",
          "subPages",
          parentSubPageId,
          "nestedSubPages",
          nestedSubPageId,
          "quizzes",
          actualQuizId,
          "questions",
          questionDocId
        );

        await setDoc(docRef, {
          ...questionContent,
          lastUpdated: new Date().toISOString(),
          version: "1.0",
        });

        results.push({
          questionId: questionDocId,
          originalId: question.id,
          success: true,
        });
      } catch (error) {
        errors.push({
          questionId: question.id?.toString() || "unknown",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: errors.length === 0,
      message: `Uploaded ${results.length} questions successfully${
        errors.length > 0 ? `, ${errors.length} failed` : ""
      }`,
      data: {
        successful: results,
        failed: errors,
      },
    };
  } catch (error) {
    console.error("Error bulk uploading questions:", error);
    return {
      success: false,
      message: `Failed to bulk upload questions: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete question (for entrance exam quiz)
export const deleteNursingEntranceExamQuizQuestion = async (
  parentSubPageId: string,
  nestedSubPageId: string,
  quizId: string,
  questionId: string
) => {
  try {
    // First, resolve the quiz document ID from the slug if needed
    let actualQuizId = quizId;

    // Try to get the quiz to resolve the document ID
    const quizResult = await getNursingEntranceExamQuiz(
      parentSubPageId,
      nestedSubPageId,
      quizId
    );

    // If quiz was found, use its document ID (which is stored in the data)
    if (quizResult.success && quizResult.data) {
      const quizData = quizResult.data as any;
      // Always use the document ID from the quiz data (it will be the actual Firestore document ID)
      if (quizData.id) {
        actualQuizId = quizData.id;
      }
    }

    const docRef = doc(
      db,
      "pillarPages",
      "nursing-entrance-exam",
      "subPages",
      parentSubPageId,
      "nestedSubPages",
      nestedSubPageId,
      "quizzes",
      actualQuizId,
      "questions",
      questionId
    );
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Question ${questionId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting question ${questionId}:`, error);
    return {
      success: false,
      message: `Failed to delete question ${questionId}: ${
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

// ==================== QUESTION TYPES OPERATIONS ====================

// Get all question types
export const getAllQuestionTypes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "questionTypes"));
    const questionTypes: any[] = [];

    querySnapshot.forEach((doc) => {
      questionTypes.push({
        id: doc.id,
        questionTypeId: doc.id,
        ...doc.data(),
      });
    });

    // Sort by questionTypeId
    questionTypes.sort((a, b) => {
      const idA = parseInt(a.questionTypeId) || 0;
      const idB = parseInt(b.questionTypeId) || 0;
      return idA - idB;
    });

    return {
      success: true,
      data: questionTypes,
      message: "All question types retrieved successfully!",
    };
  } catch (error) {
    console.error("Error getting question types:", error);
    return {
      success: false,
      message: `Failed to retrieve question types: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Get a specific question type
export const getQuestionType = async (questionTypeId: string) => {
  try {
    const docRef = doc(db, "questionTypes", questionTypeId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: docSnap.data(),
        message: `Question type ${questionTypeId} retrieved successfully!`,
      };
    } else {
      return {
        success: false,
        message: `No question type found for ${questionTypeId}`,
      };
    }
  } catch (error) {
    console.error(`Error getting question type ${questionTypeId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve question type ${questionTypeId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Upload/update question type
export const uploadQuestionType = async (
  questionTypeId: string,
  content: any
) => {
  try {
    const docRef = doc(db, "questionTypes", questionTypeId);
    await setDoc(docRef, {
      ...content,
      questionTypeId,
      lastUpdated: new Date().toISOString(),
      version: content.version || "1.0",
    });

    return {
      success: true,
      message: `Question type ${questionTypeId} uploaded successfully!`,
    };
  } catch (error) {
    console.error(`Error uploading question type ${questionTypeId}:`, error);
    return {
      success: false,
      message: `Failed to upload question type ${questionTypeId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Delete question type
export const deleteQuestionType = async (questionTypeId: string) => {
  try {
    const docRef = doc(db, "questionTypes", questionTypeId);
    await deleteDoc(docRef);

    return {
      success: true,
      message: `Question type ${questionTypeId} deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting question type ${questionTypeId}:`, error);
    return {
      success: false,
      message: `Failed to delete question type ${questionTypeId}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
};

// Seed question types (initial data)
export const seedQuestionTypes = async () => {
  const questionTypes = [
    {
      questionTypeId: "1",
      questionId: 1,
      contentDescription:
        "Standard multiple-choice question with a single correct option and rationales.",
      questionTypeName: "Single-Select Multiple Choice",
    },
    {
      questionTypeId: "2",
      questionId: 2,
      contentDescription:
        'Multiple-choice question where the user selects more than one correct option (e.g., "Select all that apply") and rationales.',
      questionTypeName: "Multiple-Select / Select All That Apply (SATA)",
    },
    {
      questionTypeId: "3",
      questionId: 3,
      contentDescription: "A statement that requires a True or False answer.",
      questionTypeName: "True/False",
    },
    {
      questionTypeId: "5",
      questionId: 5,
      contentDescription:
        "Requires matching items from an options list to corresponding explanations/descriptions. The structure includes match_option.",
      questionTypeName: "Matching (List to Explanation)",
    },
    {
      questionTypeId: "6",
      questionId: 6,
      contentDescription:
        "Requires putting a series of steps (medication administration order) into the correct sequence.",
      questionTypeName: "Ordering / Sequencing",
    },
    {
      questionTypeId: "7",
      questionId: 7,
      contentDescription:
        "A calculation problem (dosage calculation) requiring a numerical answer to be rounded.",
      questionTypeName: "Calculation / Fill-in-the-Blank (Numeric)",
    },
    {
      questionTypeId: "9",
      questionId: 9,
      contentDescription:
        "Requires the user to click a specific location on an image to select the answer (xRanges and yRanges coordinates).",
      questionTypeName: "Hot Spot / Image-Based Selection",
    },
    {
      questionTypeId: "10",
      questionId: 10,
      contentDescription:
        'Requires classifying multiple interventions as either "Indicated" or "Not Indicated" based on client data (Exhibit/Tabs format).',
      questionTypeName: "Classification / Indicated vs. Not Indicated",
    },
    {
      questionTypeId: "11",
      questionId: 11,
      contentDescription:
        "Requires the user to click on specific text-based findings to highlight the correct answers.",
      questionTypeName: "Highlight / Text-Based Selection",
    },
    {
      questionTypeId: "12",
      questionId: 12,
      contentDescription:
        "Requires dragging/selecting multiple choices to complete a diagram, assigning condition, actions, and monitoring parameters.",
      questionTypeName: "Drag-and-Drop / Complete the Diagram",
    },
    {
      questionTypeId: "13",
      questionId: 13,
      contentDescription:
        "Requires selecting options from dropdown lists to complete a sentence based on the clinical data.",
      questionTypeName: "Dropdown / Cloze",
    },
    {
      questionTypeId: "14",
      questionId: 14,
      contentDescription:
        "Requires classifying multiple findings against two different disease processes (Preeclampsia vs. HELLP Syndrome).",
      questionTypeName: "Matrix / Classification (Multiple Columns)",
    },
  ];

  try {
    const results = [];
    for (const questionType of questionTypes) {
      const result = await uploadQuestionType(
        questionType.questionTypeId,
        questionType
      );
      results.push({
        questionTypeId: questionType.questionTypeId,
        success: result.success,
        message: result.message,
      });
    }

    return {
      success: true,
      data: results,
      message: "Question types seeded successfully!",
    };
  } catch (error) {
    console.error("Error seeding question types:", error);
    return {
      success: false,
      message: `Failed to seed question types: ${
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

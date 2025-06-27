
interface InstagramProfile {
  username: string;
  fullName?: string;
  profilePicUrlHD: string;
  exists: boolean;
}

interface ApifyResponse {
  username?: string;
  fullName?: string;
  profilePicUrlHD?: string;
  profilePicUrl?: string;
  biography?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
  url?: string;
  urlsFromSearch?: string[];
  // Additional possible nested structures
  owner?: any;
  graphql?: any;
  data?: any;
}

export class InstagramService {
  private static APIFY_API_URL = 'https://api.apify.com/v2/actor-tasks/chatty_coaster~instagram-scraper-task/run-sync?token=apify_api_Tk435sUb2WnBllXsxxfNQaBLkHSZyz0HLRCO';

  static async getProfile(username: string): Promise<InstagramProfile> {
    try {
      console.log('🔍 Fetching Instagram profile for:', username);
      
      const cleanUsername = username.replace('@', '');
      
      const configuration = {
        search: `https://www.instagram.com/${cleanUsername}/`,
        searchType: "user",
        searchLimit: 1,
        resultsType: "details",
        resultsLimit: 1,
        addParentData: true,
        includeHasStories: true,
        includeHasHighlights: true,
        includeRecentPosts: true,
        enhanceUserSearchWithFacebookPage: false,
        extendOutputFunction: `async ({ data }) => {
          return {
            ...data,
            directProfileData: true
          };
        }`,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"]
        }
      };

      console.log('🧪 Sending this configuration to Apify:', JSON.stringify(configuration, null, 2));
      
      const response = await fetch(this.APIFY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuration)
      });

      if (!response.ok) {
        console.log('❌ Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('❌ Error response body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseJson = await response.json();
      
      console.log("🔴 Raw Apify JSON response:", responseJson);
      
      // Parse the response and extract profile data
      const profileData = this.parseApifyResponse(responseJson, cleanUsername);
      
      console.log("🟢 Parsed Profile Data:", profileData);
      
      if (profileData && profileData.exists) {
        console.log('✅ FINAL PARSED PROFILE DATA:', JSON.stringify(profileData, null, 2));
        return profileData;
      }

      // If no profile data found, return basic profile with placeholder
      console.log('⚠️ No profile data found, returning placeholder');
      const placeholderProfile = {
        username: cleanUsername,
        fullName: cleanUsername,
        profilePicUrlHD: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&size=400&background=fb923c&color=ffffff&bold=true`,
        exists: true
      };
      
      return placeholderProfile;
      
    } catch (error) {
      console.error('💥 Error fetching Instagram profile:', error);
      return {
        username: username.replace('@', ''),
        fullName: undefined,
        profilePicUrlHD: '',
        exists: false
      };
    }
  }

  private static parseApifyResponse(responseJson: any, username: string): InstagramProfile | null {
    console.log('🔧 PARSING - Starting to parse response for username:', username);
    
    // Function to extract profile data from an object
    const extractProfileData = (obj: any, path: string = 'root'): Partial<InstagramProfile> | null => {
      if (!obj) {
        console.log(`🔧 PARSING - Object at ${path} is null/undefined`);
        return null;
      }
      
      console.log(`🔧 PARSING - Checking object at ${path}:`, JSON.stringify(obj, null, 2));
      
      // Look for direct profile fields with comprehensive field mapping
      const possibleFields = {
        username: obj.username || obj.user_name || obj.handle || obj.userName,
        fullName: obj.fullName || obj.full_name || obj.displayName || obj.display_name || obj.name || obj.realName,
        profilePicUrlHD: obj.profilePicUrlHD || obj.profile_pic_url_hd || obj.profilePicUrl || obj.profile_pic_url || obj.avatar || obj.picture || obj.profilePictureUrl
      };

      console.log(`🔧 PARSING - Extracted fields from ${path}:`, possibleFields);

      // If we found any profile data, return it
      if (possibleFields.username || possibleFields.profilePicUrlHD) {
        console.log(`✅ PARSING - Found profile data at ${path}`);
        return possibleFields;
      }
      
      return null;
    };

    // Check direct object first
    const directExtraction = extractProfileData(responseJson, 'direct');
    if (directExtraction && directExtraction.profilePicUrlHD && !directExtraction.profilePicUrlHD.includes("ui-avatars.com")) {
      return {
        username: directExtraction.username || username,
        fullName: directExtraction.fullName || directExtraction.username || username,
        profilePicUrlHD: directExtraction.profilePicUrlHD,
        exists: true
      };
    }

    // Handle array response
    if (Array.isArray(responseJson)) {
      console.log('🔧 PARSING - Processing array response');
      
      for (let i = 0; i < responseJson.length; i++) {
        const item = responseJson[i];
        const extracted = extractProfileData(item, `array[${i}]`);
        if (extracted && extracted.profilePicUrlHD && !extracted.profilePicUrlHD.includes("ui-avatars.com")) {
          return {
            username: extracted.username || username,
            fullName: extracted.fullName || extracted.username || username,
            profilePicUrlHD: extracted.profilePicUrlHD,
            exists: true
          };
        }

        // Check nested structures within array items
        const nestedPaths = [
          { obj: item.owner, path: `array[${i}].owner` },
          { obj: item.user, path: `array[${i}].user` },
          { obj: item.graphql?.user, path: `array[${i}].graphql.user` },
          { obj: item.data, path: `array[${i}].data` },
          { obj: item.profile, path: `array[${i}].profile` },
          { obj: item.userInfo, path: `array[${i}].userInfo` }
        ];

        for (const nested of nestedPaths) {
          if (nested.obj) {
            const nestedExtracted = extractProfileData(nested.obj, nested.path);
            if (nestedExtracted && nestedExtracted.profilePicUrlHD && !nestedExtracted.profilePicUrlHD.includes("ui-avatars.com")) {
              return {
                username: nestedExtracted.username || username,
                fullName: nestedExtracted.fullName || nestedExtracted.username || username,
                profilePicUrlHD: nestedExtracted.profilePicUrlHD,
                exists: true
              };
            }
          }
        }
      }
    }

    // Check nested structures in direct object
    const nestedPaths = [
      { obj: responseJson.owner, path: 'direct.owner' },
      { obj: responseJson.user, path: 'direct.user' },
      { obj: responseJson.graphql?.user, path: 'direct.graphql.user' },
      { obj: responseJson.data, path: 'direct.data' },
      { obj: responseJson.profile, path: 'direct.profile' },
      { obj: responseJson.userInfo, path: 'direct.userInfo' }
    ];

    for (const nested of nestedPaths) {
      if (nested.obj) {
        const nestedExtracted = extractProfileData(nested.obj, nested.path);
        if (nestedExtracted && nestedExtracted.profilePicUrlHD && !nestedExtracted.profilePicUrlHD.includes("ui-avatars.com")) {
          return {
            username: nestedExtracted.username || username,
            fullName: nestedExtracted.fullName || nestedExtracted.username || username,
            profilePicUrlHD: nestedExtracted.profilePicUrlHD,
            exists: true
          };
        }
      }
    }

    // If we have urlsFromSearch, profile exists but no detailed data - only use as last resort
    if (responseJson.urlsFromSearch && responseJson.urlsFromSearch.length > 0) {
      console.log('🔗 PARSING - Found urlsFromSearch but no detailed profile data');
      return {
        username: username,
        fullName: username,
        profilePicUrlHD: '',
        exists: true
      };
    }

    console.log('❌ PARSING - No profile data found anywhere in response');
    return null;
  }
}

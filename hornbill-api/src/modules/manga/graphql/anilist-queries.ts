export const ANILIST_SINGLE_MANGA_QUERY = `
query ($id: Int) {
  Media(id: $id, type: MANGA) {
    id
    title {
      romaji
      english
      native
    }
    description
    coverImage {
      extraLarge
      large
      medium
    }
    bannerImage
    genres
    tags {
      name
      rank
    }
    status
    chapters
    volumes
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    averageScore
    meanScore
    popularity
    favourites
    staff {
      edges {
        role
        node {
          name {
            full
            native
          }
        }
      }
    }
    isAdult
  }
}
`;

export const ANILIST_MANGA_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort]) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(type: MANGA, sort: $sort) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
        large
        medium
      }
      bannerImage
      genres
      tags {
        name
        rank
      }
      status
      chapters
      volumes
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      averageScore
      meanScore
      popularity
      favourites
      staff {
        edges {
          role
          node {
            name {
              full
              native
            }
          }
        }
      }
      isAdult
    }
  }
}
`;

export const parseTags = (tagString) => {
  if (!tagString) return [];

  return tagString
    .split(/\s+/) // 공백 단위 분리
    .filter((tag) => tag.startsWith("#")) // #로 시작하는 것만
    .map((tag) => tag.replace(/^#/, "")) // # 없애기
    .filter((tag) => tag.length > 0) //문자 태그만
    .map((t) => t.toLowerCase()); // 소문자로 통일
};

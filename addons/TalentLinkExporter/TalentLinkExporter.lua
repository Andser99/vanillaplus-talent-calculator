local glyphString = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

local glyphs = {}
local i = 1

while i <= string.len(glyphString) do
    glyphs[i - 1] = string.sub(glyphString, i, i)
    i = i + 1
end

local function encodeState(numbers)
    local result = ""
    local i = 1

    while i <= table.getn(numbers) do
        local first = numbers[i]
        local second = numbers[i + 1]

        if first == nil then first = 0 end
        if second == nil then second = 0 end

        local index = first * 6 + second
        result = result .. glyphs[index]

        i = i + 2
    end

    return result
end

local function getTalentArray(tab)
    local arr = {}
    local num = GetNumTalents(tab)

    local i = 1
    while i <= num do
        local _, _, _, _, rank = GetTalentInfo(tab, i)
        arr[i] = rank or 0
        i = i + 1
    end

    return arr
end

local function trimEndZeros(list)
    local last = 0
    local i = 1

    while list[i] do
        if list[i] ~= "0" then
            last = i
        end
        i = i + 1
    end

    local result = {}
    i = 1

    while i <= last do
        result[i] = list[i]
        i = i + 1
    end

    return result
end

local function splitChars(str)
    local t = {}
    local i = 1

    while i <= string.len(str) do
        t[table.getn(t) + 1] = string.sub(str, i, i)
        i = i + 1
    end

    return t
end

local function isAllZero(list)
    local i = 1
    while list[i] do
        if list[i] ~= "0" then
            return false
        end
        i = i + 1
    end
    return true
end

local function getTalentHash()
    local tabs = GetNumTalentTabs()
    local result = ""
    local hasNonEmpty = false

    local tab = 1
    while tab <= tabs do
        local arr = getTalentArray(tab)
        local encoded = encodeState(arr)

        local chars = splitChars(encoded)
        local trimmed = trimEndZeros(chars)

        local cleaned = ""

        local i = 1
        while i <= table.getn(trimmed) do
            cleaned = cleaned .. trimmed[i]
            i = i + 1
        end

        if cleaned == "" or isAllZero(trimmed) then
            cleaned = "0"
        else
            hasNonEmpty = true
        end

        if result == "" then
            result = cleaned
        else
            result = result .. "-" .. cleaned
        end

        tab = tab + 1
    end

    if not hasNonEmpty then
        result = "0"
    end

    return result
end

local function GetPlayerClassSlug()
    local _, class = UnitClass("player")
    return string.lower(class)
end

local function GetTalentLink()
    return "https://andser99.github.io/vanillaplus-talent-calculator/#/"
        .. GetPlayerClassSlug() .. "/" .. getTalentHash()
end

local frame = CreateFrame("Frame", "TalentHashFrame", UIParent)
frame:SetWidth(500)
frame:SetHeight(60)
frame:SetPoint("CENTER", UIParent, "CENTER", 0, 0)
frame:SetMovable(true)
frame:EnableMouse(true)
frame:RegisterForDrag("LeftButton")

frame:SetScript("OnDragStart", function() this:StartMoving() end)
frame:SetScript("OnDragStop", function() this:StopMovingOrSizing() end)

frame:SetBackdrop({
    bgFile = "Interface/Tooltips/UI-Tooltip-Background",
    edgeFile = "Interface/Tooltips/UI-Tooltip-Border",
    tile = true,
    tileSize = 16,
    edgeSize = 12,
    insets = { 2, 2, 2, 2 }
})

frame:SetBackdropColor(0, 0, 0, 0.85)

local title = frame:CreateFontString(nil, "OVERLAY", "GameFontNormal")
title:SetPoint("TOP", 0, -10)
title:SetText("Talent Link - Just press \"Ctrl-C\"")

local editBox = CreateFrame("EditBox", nil, frame)
editBox:SetWidth(440)
editBox:SetHeight(40)
editBox:SetPoint("CENTER", 0, -10)
editBox:SetFontObject(GameFontHighlightSmall)
editBox:SetMultiLine(true)
editBox:SetAutoFocus(false)
editBox:SetJustifyH("LEFT")
editBox:SetJustifyV("TOP")
editBox:SetTextInsets(8, 8, 8, 8)

editBox:SetScript("OnEscapePressed", function() frame:Hide() end)
editBox:SetScript("OnMouseDown", function()
    editBox:SetFocus()
    editBox:HighlightText()
end)

frame:SetScript("OnShow", function()
    editBox:SetFocus()
    editBox:HighlightText()
end)

local closeBtn = CreateFrame("Button", nil, frame, "UIPanelCloseButton")
closeBtn:SetPoint("TOPRIGHT", frame, "TOPRIGHT", 0, 0)

frame:Hide()

local function ShowHashFrame()
    editBox:SetText(GetTalentLink())
    frame:Show()
end

SLASH_TALENTHASH1 = "/talenthash"
SlashCmdList["TALENTHASH"] = function()
    ShowHashFrame()
end

local buttonCreated = false

local f = CreateFrame("Frame")

f:SetScript("OnUpdate", function()
    local tf = TalentFrame or PlayerTalentFrame

    if tf and tf:IsVisible() and not buttonCreated then

        local btn = CreateFrame("Button", nil, tf, "UIPanelButtonTemplate")
        btn:SetWidth(130)
        btn:SetHeight(22)
        btn:SetPoint("TOPRIGHT", tf, "TOPRIGHT", -120, -30)

        local text = btn:CreateFontString(nil, "OVERLAY", "GameFontNormalSmall")
        text:SetAllPoints()
        text:SetText("Get Build Link")

        btn:SetScript("OnClick", function()
            ShowHashFrame()
        end)

        buttonCreated = true
    end
end)
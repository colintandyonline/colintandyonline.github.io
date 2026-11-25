param([switch]$PrivateReview)
$ErrorActionPreference='Stop'
$owner='colintandyonline';$number=11
# Fetch only this public roadmap and its selected field values. This avoids the broad,
# high-cost GitHub CLI project item-list query and does not access private boards.
$query=@'
query($pid:ID!){
 node(id:$pid){
  ... on ProjectV2{
   id title number public url
   items(first:100){
    pageInfo{hasNextPage}
    nodes{
     id
     content{... on DraftIssue{title}}
     fieldValues(first:20){
      nodes{
       ... on ProjectV2ItemFieldSingleSelectValue{name field{... on ProjectV2SingleSelectField{name}}}
       ... on ProjectV2ItemFieldDateValue{date field{... on ProjectV2Field{name}}}
       ... on ProjectV2ItemFieldTextValue{text field{... on ProjectV2Field{name}}}
      }
     }
    }
   }
  }
 }
}
'@
$request=@{query=$query;variables=@{pid='PVT_kwHODTdk384BtOlV'}}|ConvertTo-Json -Depth 8 -Compress
$raw=$request | & gh.exe api graphql --input - 2>&1
if($LASTEXITCODE -ne 0){throw 'Public roadmap GraphQL read failed'}
$response=($raw -join '')|ConvertFrom-Json
if($response.errors){throw 'Public roadmap GraphQL returned errors'}
$board=$response.data.node
$canonical="https://github.com/users/$owner/projects/$number"
if($board.title -ne 'CTDG Public Development Roadmap' -or $board.number -ne $number -or $board.url -ne $canonical){throw 'Unexpected source project'}
if(-not $board.public -and -not $PrivateReview){throw 'Source roadmap is not public'}
if($board.items.pageInfo.hasNextPage){throw 'Roadmap item page truncated; review required'}
$selected=[System.Collections.Generic.List[object]]::new()
foreach($entry in $board.items.nodes){
 if(-not $entry.content.title){throw 'Public board has an unexpected item type'}
 $projection=[pscustomobject]@{id=$entry.id;title=$entry.content.title;content=[pscustomobject]@{type='DraftIssue'}}
 foreach($fieldValue in $entry.fieldValues.nodes){
  $fieldName=[string]$fieldValue.field.name
  if([string]::IsNullOrWhiteSpace($fieldName)){continue}
  $value=$null
  if($null -ne $fieldValue.PSObject.Properties['date']){$value=$fieldValue.date}
  elseif($null -ne $fieldValue.PSObject.Properties['text']){$value=$fieldValue.text}
  elseif($null -ne $fieldValue.PSObject.Properties['name']){$value=$fieldValue.name}
  if($fieldName -in @('Project','Stage','Lifecycle','Earliest recorded development','Milestone start','Target date','Completed date','Evidence label','Public URL')){
   $projection|Add-Member -NotePropertyName $fieldName -NotePropertyValue $value
  }
 }
 $selected.Add($projection)
}
$data=[pscustomobject]@{items=@($selected)}
$categories=@('CTDG Website','Interactive Demos','KayaCart','Gandalf Mobile','Axiom Architect','DeepMind Resources','TrailTrade','Command Centre','Managed AI','AI Research','Engineering Portfolio')
$stages=@('Planned','In progress','Completed')
$lifecycles=@('Live','Active development','Research','Engineering')
$hosts=@('ctdigital.group','www.axiom-architect.co','axiom-studio.co','v0-ai-learning-platform-nine-henna.vercel.app','trailtrade-live.vercel.app','colintandyonline.github.io')
function Prop($obj,[string]$key){$p=$obj.PSObject.Properties[$key];if($null -eq $p){return $null};return $p.Value}
function SafeUrl([string]$value){
 $u=$null
 if(-not [uri]::TryCreate($value,[UriKind]::Absolute,[ref]$u) -or $u.Scheme -ne 'https'){return $false}
 if($u.Host -eq 'github.com'){return ($u.AbsolutePath -match '^/colintandyonline(?:/|$)' -or $u.AbsolutePath -match '^/users/colintandyonline/projects/11(?:/|$)')}
 return ($u.Host -in $hosts)
}
function ValidDate($value){
 if([string]::IsNullOrWhiteSpace($value)){return $null}
 $s=[string]$value;$p=[DateTime]::MinValue
 if(-not [DateTime]::TryParseExact($s,'yyyy-MM-dd',[cultureinfo]::InvariantCulture,[Globalization.DateTimeStyles]::None,[ref]$p)){throw 'Invalid date field'}
 return $s
}
$items=[System.Collections.Generic.List[object]]::new()
$ids=[System.Collections.Generic.HashSet[string]]::new()
foreach($i in $data.items){
 if($i.content.type -ne 'DraftIssue'){throw 'Non-approved public item type'}
 $category=[string](Prop $i 'project');$stage=[string](Prop $i 'stage');$lifecycle=[string](Prop $i 'lifecycle')
 $url=[string](Prop $i 'public URL');$evidence=[string](Prop $i 'evidence label')
 if($category -notin $categories -or $stage -notin $stages -or $lifecycle -notin $lifecycles){throw 'Unexpected public selection'}
 if(-not (SafeUrl $url)){throw 'Unexpected public URL'}
 if(-not $i.title -or -not $evidence -or $i.title.Length -gt 150 -or $evidence.Length -gt 320){throw 'Unexpected public title/evidence'}
 if(-not $ids.Add($i.id)){throw 'Duplicate item'}
 $start=ValidDate (Prop $i 'milestone start');$completed=ValidDate (Prop $i 'completed date')
 if(($stage -eq 'Completed') -ne [bool]$completed){throw 'Unverified completion mismatch'}
 $items.Add([ordered]@{
  id=$i.id;title=[string]$i.title;project=$category;stage=$stage;lifecycle=$lifecycle
  earliestRecordedDevelopment=ValidDate (Prop $i 'earliest recorded development')
  milestoneStart=$start;targetDate=ValidDate (Prop $i 'target date');completedDate=$completed
  evidenceLabel=$evidence;publicUrl=$url
 })
}
if($items.Count -lt 10){throw 'Incomplete public roadmap'}
$source=[ordered]@{projectNumber=$number;url=$canonical;generatedAt=([DateTime]::UtcNow).ToString('yyyy-MM-ddTHH:mm:ssZ');access='Reviewed public-field allowlist'}
$payload=[ordered]@{schemaVersion=1;source=$source;items=@($items)}
$path=Join-Path (Split-Path -Parent $PSScriptRoot) 'roadmap.json'
[IO.File]::WriteAllText($path,($payload|ConvertTo-Json -Depth 15),[Text.UTF8Encoding]::new($false))
Write-Output "ROADMAP_ITEMS=$($items.Count) COMPLETED=$( @($items|Where-Object stage -eq 'Completed').Count )"
Write-Output "ROADMAP_DATA=$path"

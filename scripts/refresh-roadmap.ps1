param([switch]$PrivateReview)
$ErrorActionPreference='Stop'
$owner='colintandyonline';$number=11
function GithubJSON([string[]]$argsList){
 $r=& gh.exe @argsList 2>&1
 if($LASTEXITCODE -ne 0){throw "GitHub request failed: $($argsList[0])"}
 return (($r -join [Environment]::NewLine)|ConvertFrom-Json)
}
$board=GithubJSON @('project','view',"$number",'--owner',$owner,'--format','json')
$canonical="https://github.com/users/$owner/projects/$number"
if($board.title -ne 'CTDG Public Development Roadmap' -or $board.url -ne $canonical){throw 'Unexpected source project'}
if(-not $board.public -and -not $PrivateReview){throw 'Source roadmap is not public'}
$data=GithubJSON @('project','item-list',"$number",'--owner',$owner,'--format','json','--limit','100')
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
